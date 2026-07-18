from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.modules.clinical_orders.service import ClinicalServiceCatalogService
from app.modules.simulation import clinical_service_router
from app.modules.simulation.clinical_service_fixtures import CLINICAL_SERVICE_SEEDS
from app.modules.simulation.clinical_service_repository import (
    SqliteClinicalServiceRepository,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def use_isolated_catalog(tmp_path, monkeypatch) -> None:
    isolated_service = ClinicalServiceCatalogService(
        SqliteClinicalServiceRepository(tmp_path / "api-test.db")
    )
    isolated_service.seed_if_empty(CLINICAL_SERVICE_SEEDS)
    monkeypatch.setattr(clinical_service_router, "service", isolated_service)


def test_hospital_feed_contains_seeded_clinical_services() -> None:
    response = client.get(
        "/api/v1/simulation/clinical-services/hospital-feed"
    )

    assert response.status_code == 200
    data = response.json()
    assert data["contract_version"] == "clinical-service-feed.v1"
    assert data["source_system"] == "hospital-simulator"
    assert data["is_simulation"] is True
    assert data["total"] >= 4
    assert all(item["active"] for item in data["services"])


def test_create_update_and_deactivate_clinical_service() -> None:
    code = f"LAB-{uuid4().hex[:8].upper()}"
    payload = {
        "code": code,
        "name": "Xét nghiệm API",
        "service_group": "laboratory",
        "room_service_type": "xray",
        "description": "Dữ liệu kiểm thử API",
        "execution_minutes_min": 4,
        "execution_minutes_max": 6,
        "turnaround_minutes_min": 40,
        "turnaround_minutes_max": 60,
        "fasting_policy": "required",
        "fasting_hours_min": 6,
        "fasting_hours_max": 8,
        "scheduling_priority": "morning",
        "notes": "Làm trước 9 giờ.",
        "room_locations": ["201 K2"],
        "active": True,
    }

    create_response = client.post(
        "/api/v1/simulation/clinical-services",
        json=payload,
    )
    assert create_response.status_code == 201
    assert create_response.json()["version"] == 1

    update_response = client.put(
        f"/api/v1/simulation/clinical-services/{code}",
        json={
            **{key: value for key, value in payload.items() if key != "code"},
            "name": "Xét nghiệm API đã sửa",
            "expected_version": 1,
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["version"] == 2

    deactivate_response = client.delete(
        f"/api/v1/simulation/clinical-services/{code}?expected_version=2"
    )
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["active"] is False
