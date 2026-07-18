from pathlib import Path

from app.modules.reservations.repository import SqliteRouteReservationRepository
from app.modules.reservations.schemas import (
    CreateRouteReservationRequest,
    JourneyStatus,
)
from app.modules.reservations.service import RouteReservationService
from app.modules.routing.repository import SqliteRouteProposalRepository
from app.modules.routing.schemas import CreateRouteProposalRequest
from app.modules.routing.service import RouteProposalService


def test_route_and_patient_progress_survive_service_restart(tmp_path: Path) -> None:
    database_path = tmp_path / "central-backend.db"
    proposal_repository = SqliteRouteProposalRepository(database_path)
    reservation_repository = SqliteRouteReservationRepository(database_path)
    proposal_service = RouteProposalService(repository=proposal_repository)
    reservation_service = RouteReservationService(
        proposal_service=proposal_service,
        repository=reservation_repository,
    )

    proposal = proposal_service.create_proposal(
        "TM-PERSIST-001",
        CreateRouteProposalRequest(),
    )
    hold = reservation_service.create_hold(
        CreateRouteReservationRequest(
            encounter_id=proposal.encounter_id,
            route_proposal_id=proposal.id,
            route_option_id=proposal.options[0].id,
            idempotency_key="persistent-journey-key",
            patient_code="BN-PERSIST-001",
            clinical_order_id="SIM-ORDER-PERSIST-001",
        )
    )
    confirmed = reservation_service.confirm(hold.id)
    reservation_service.update_progress(
        confirmed.id,
        current_step=2,
        journey_status=JourneyStatus.ACTIVE,
    )

    restarted_proposal_service = RouteProposalService(
        repository=SqliteRouteProposalRepository(database_path)
    )
    restarted_reservation_service = RouteReservationService(
        proposal_service=restarted_proposal_service,
        repository=SqliteRouteReservationRepository(database_path),
    )

    restored = restarted_reservation_service.get_latest_for_patient("BN-PERSIST-001")
    restored_proposal, restored_option = restarted_proposal_service.get_valid_option(
        proposal.id,
        proposal.options[0].id,
        proposal.encounter_id,
    )

    assert restored.status == "confirmed"
    assert restored.current_step == 2
    assert restored.journey_status == "active"
    assert restored.clinical_order_id == "SIM-ORDER-PERSIST-001"
    assert restored_proposal.id == proposal.id
    assert restored_option.id == proposal.options[0].id
