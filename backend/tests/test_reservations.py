from fastapi.testclient import TestClient

from app.main import app
from app.modules.reservations.schemas import CreateRouteReservationRequest
from app.modules.reservations.service import RouteReservationService
from app.modules.routing.schemas import CreateRouteProposalRequest
from app.modules.routing.service import RouteProposalService


def create_demo_hold(
    reservation_service: RouteReservationService,
    proposal_service: RouteProposalService,
    idempotency_key: str = "demo-hold-key",
):
    proposal = proposal_service.create_proposal(
        "TM-2026-00847",
        CreateRouteProposalRequest(),
    )
    return reservation_service.create_hold(
        CreateRouteReservationRequest(
            encounter_id=proposal.encounter_id,
            route_proposal_id=proposal.id,
            route_option_id=proposal.options[0].id,
            idempotency_key=idempotency_key,
        )
    )


def test_hold_and_confirm_are_idempotent() -> None:
    proposal_service = RouteProposalService()
    service = RouteReservationService(proposal_service=proposal_service)
    first_hold = create_demo_hold(service, proposal_service)
    repeated_hold = service.create_hold(
        CreateRouteReservationRequest(
            encounter_id=first_hold.encounter_id,
            route_proposal_id=first_hold.route_proposal_id,
            route_option_id=first_hold.route_option_id,
            idempotency_key="demo-hold-key",
        )
    )

    first_confirmation = service.confirm(first_hold.id)
    repeated_confirmation = service.confirm(first_hold.id)

    assert repeated_hold.id == first_hold.id
    assert first_confirmation.status == "confirmed"
    assert repeated_confirmation.journey_id == first_confirmation.journey_id


def test_hold_can_only_be_extended_once() -> None:
    proposal_service = RouteProposalService()
    service = RouteReservationService(proposal_service=proposal_service)
    hold = create_demo_hold(service, proposal_service)

    extended = service.extend(hold.id)

    assert extended.extension_count == 1
    assert extended.expires_at > hold.expires_at


def test_reservation_api_rejects_option_not_in_proposal() -> None:
    client = TestClient(app)
    proposal_response = client.post(
        "/api/v1/encounters/TM-2026-00847/route-proposals",
        json={},
    )
    proposal = proposal_response.json()

    response = client.post(
        "/api/v1/route-reservations",
        json={
            "encounter_id": "TM-2026-00847",
            "route_proposal_id": proposal["id"],
            "route_option_id": "unknown-option",
            "idempotency_key": "unknown-option-key",
        },
    )

    assert response.status_code == 404


def test_reservation_api_creates_and_confirms_journey() -> None:
    client = TestClient(app)
    proposal_response = client.post(
        "/api/v1/encounters/TM-2026-00847/route-proposals",
        json={"schedule_strategy": "leave_fast", "priority": "fastest"},
    )
    proposal = proposal_response.json()
    hold_response = client.post(
        "/api/v1/route-reservations",
        json={
            "encounter_id": "TM-2026-00847",
            "route_proposal_id": proposal["id"],
            "route_option_id": proposal["options"][0]["id"],
            "idempotency_key": "api-confirm-key",
        },
    )

    confirmation = client.post(
        f"/api/v1/route-reservations/{hold_response.json()['id']}/confirm"
    )

    assert hold_response.status_code == 201
    assert confirmation.status_code == 200
    assert confirmation.json()["status"] == "confirmed"
    assert confirmation.json()["journey_id"].startswith("journey-")
