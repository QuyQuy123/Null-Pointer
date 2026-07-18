from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.modules.clinical_orders.service import ClinicalServiceCatalogService
from app.modules.routing.service import RouteProposalService
from app.modules.simulation import clinical_order_router
from app.modules.simulation.clinical_order_repository import (
    SqliteClinicalOrderRepository,
)
from app.modules.simulation.clinical_order_schemas import DispatchClinicalOrderRequest
from app.modules.simulation.clinical_order_service import (
    ClinicalOrderSimulationService,
)
from app.modules.simulation.clinical_service_fixtures import CLINICAL_SERVICE_SEEDS
from app.modules.simulation.clinical_service_repository import (
    SqliteClinicalServiceRepository,
)
from app.modules.simulation.service import HospitalSimulationService


def make_service(database_path: Path) -> ClinicalOrderSimulationService:
    catalog = ClinicalServiceCatalogService(
        SqliteClinicalServiceRepository(database_path)
    )
    catalog.seed_if_empty(CLINICAL_SERVICE_SEEDS)
    simulation = HospitalSimulationService()
    return ClinicalOrderSimulationService(
        catalog=catalog,
        simulation=simulation,
        routing=RouteProposalService(simulation=simulation),
        repository=SqliteClinicalOrderRepository(database_path),
    )


def make_request() -> DispatchClinicalOrderRequest:
    return DispatchClinicalOrderRequest(
        patient_code="BN-00847",
        patient_name="Nguyễn Thị Mai",
        encounter_id="TM-2026-00847",
        doctor_name="BS. Trần Văn Hùng",
        doctor_room_code="PK-305",
        clinical_service_codes=["LAB-HEMA", "LAB-URINE"],
        priority="fastest",
        schedule_strategy="balanced",
    )


def test_dispatch_matches_operational_rooms_and_persists_patient_order(
    tmp_path: Path,
) -> None:
    service = make_service(tmp_path / "dispatch.db")

    result = service.dispatch(make_request())
    latest = service.get_latest_for_patient("BN-00847")
    recommended = result.route_proposal.options[0]

    assert latest.id == result.id
    assert [item.service_code for item in result.items] == ["LAB-HEMA", "LAB-URINE"]
    assert {room.location_code for room in result.items[0].matched_rooms} == {
        "101 K1",
        "102 K1",
        "103 K1",
    }
    assert {room.location_code for room in result.items[1].matched_rooms} == {
        "107 K1",
        "108 K1",
    }
    assert [step.service_code for step in recommended.steps] == [
        "blood_test",
        "urine_test",
        "doctor_return",
    ]
    assert recommended.steps[0].room_code.startswith("XN-")
    assert recommended.steps[1].room_code.startswith("UR-")


@pytest.fixture
def isolated_api_service(tmp_path: Path, monkeypatch) -> ClinicalOrderSimulationService:
    service = make_service(tmp_path / "dispatch-api.db")
    monkeypatch.setattr(clinical_order_router, "service", service)
    return service


def test_dispatch_api_sends_order_that_patient_can_receive(
    isolated_api_service: ClinicalOrderSimulationService,
) -> None:
    client = TestClient(app)
    request = make_request()

    dispatch_response = client.post(
        "/api/v1/simulation/clinical-orders",
        json=request.model_dump(mode="json"),
    )
    receive_response = client.get(
        "/api/v1/simulation/patients/BN-00847/clinical-orders/latest"
    )

    assert dispatch_response.status_code == 201
    assert receive_response.status_code == 200
    assert receive_response.json()["id"] == dispatch_response.json()["id"]
    assert receive_response.json()["route_proposal"]["options"]
