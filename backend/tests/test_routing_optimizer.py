import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.modules.routing.exceptions import NoFeasibleRouteError
from app.modules.routing.schemas import (
    CreateRouteProposalRequest,
    RouteLabel,
    ScheduleStrategy,
    ServiceCode,
)
from app.modules.routing.service import RouteProposalService
from app.modules.simulation.runtime import simulation_service
from app.shared.enums import RoutePriority

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_shared_simulation() -> None:
    simulation_service.reset()


def test_proposal_uses_live_rooms_and_preserves_required_services() -> None:
    request = CreateRouteProposalRequest()

    proposal = RouteProposalService().create_proposal("TM-DEMO-001", request)

    assert proposal.algorithm_version == "deterministic-routing-v1"
    assert proposal.simulation_tick == 0
    assert 1 <= len(proposal.options) <= 3
    required_codes = {code.value for code in request.required_service_codes}

    for option in proposal.options:
        actual_codes = {step.service_code for step in option.steps}
        assert actual_codes == required_codes
        assert option.steps[0].service_code == ServiceCode.BLOOD_TEST
        assert option.steps[-1].service_code == ServiceCode.DOCTOR_RETURN
        assert all(step.room_code != "XQ-202" for step in option.steps)
        assert option.doctor_return_minutes is not None
        assert option.doctor_return_minutes >= option.results_ready_minutes


def test_pausing_selected_room_recalculates_all_options() -> None:
    simulation_service.set_room_operation("XQ-202", operational=True, reason=None)
    service = RouteProposalService()
    request = CreateRouteProposalRequest()
    before = service.create_proposal("TM-DEMO-002", request)
    selected_xray_room = next(
        step.room_code
        for step in before.options[0].steps
        if step.service_code == ServiceCode.CHEST_XRAY
    )

    simulation_service.set_room_operation(
        selected_xray_room,
        operational=False,
        reason="Giả lập thiết bị hỏng.",
    )
    after = service.create_proposal("TM-DEMO-002", request)

    assert all(
        step.room_code != selected_xray_room
        for option in after.options
        for step in option.steps
    )


def test_no_active_room_for_required_service_fails_closed() -> None:
    simulation_service.set_room_operation(
        "XQ-201",
        operational=False,
        reason="Giả lập thiết bị hỏng.",
    )

    with pytest.raises(NoFeasibleRouteError, match="Chụp X-quang ngực"):
        RouteProposalService().create_proposal(
            "TM-DEMO-003",
            CreateRouteProposalRequest(),
        )


def test_priority_and_schedule_strategy_are_applied_to_recommended_option() -> None:
    request = CreateRouteProposalRequest(
        priority=RoutePriority.LESS_WALK,
        schedule_strategy=ScheduleStrategy.FINISH_EARLY,
    )

    proposal = RouteProposalService().create_proposal("TM-DEMO-004", request)

    assert proposal.priority == RoutePriority.LESS_WALK
    assert proposal.schedule_strategy == ScheduleStrategy.FINISH_EARLY
    assert proposal.options[0].label == RouteLabel.RECOMMENDED
    assert "xét nghiệm" in proposal.options[0].reason.lower()


def test_subset_of_services_is_not_extended_by_algorithm() -> None:
    request = CreateRouteProposalRequest(
        required_service_codes=[
            ServiceCode.BLOOD_TEST,
            ServiceCode.CHEST_XRAY,
        ]
    )

    proposal = RouteProposalService().create_proposal("TM-DEMO-005", request)

    for option in proposal.options:
        assert [step.service_code for step in option.steps] == [
            ServiceCode.BLOOD_TEST,
            ServiceCode.CHEST_XRAY,
        ]


def test_api_rejects_unknown_or_duplicate_service_codes() -> None:
    unknown = client.post(
        "/api/v1/encounters/TM-DEMO-006/route-proposals",
        json={"required_service_codes": ["unknown_service"]},
    )
    duplicate = client.post(
        "/api/v1/encounters/TM-DEMO-006/route-proposals",
        json={"required_service_codes": ["blood_test", "blood_test"]},
    )

    assert unknown.status_code == 422
    assert duplicate.status_code == 422


def test_api_returns_conflict_instead_of_unsafe_partial_route() -> None:
    simulation_service.set_room_operation(
        "XQ-201",
        operational=False,
        reason="Giả lập thiết bị hỏng.",
    )

    response = client.post(
        "/api/v1/encounters/TM-DEMO-007/route-proposals",
        json={"required_service_codes": ["chest_xray"]},
    )

    assert response.status_code == 409
    assert "không có phòng" in response.json()["detail"].lower()


def test_proposal_records_current_simulation_tick() -> None:
    simulation_service.advance(5)

    proposal = RouteProposalService().create_proposal(
        "TM-DEMO-008",
        CreateRouteProposalRequest(),
    )

    assert proposal.simulation_tick == 1
