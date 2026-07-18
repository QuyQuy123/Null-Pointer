from pathlib import Path

from fastapi.testclient import TestClient

import app.modules.simulation.router as simulation_router_module
from app.main import app
from app.modules.simulation.room_repository import SqliteSimulationRoomRepository
from app.modules.simulation.service import HospitalSimulationService


def build_service(database_path: Path) -> HospitalSimulationService:
    repository = SqliteSimulationRoomRepository(database_path)
    return HospitalSimulationService(room_repository=repository)


def test_added_room_and_manual_queue_are_persisted(tmp_path: Path) -> None:
    service = build_service(tmp_path / "simulation.db")

    response = TestClient(app)
    original_service = simulation_router_module.service
    simulation_router_module.service = service
    try:
        created = response.post(
            "/api/v1/simulation/rooms",
            json={
                "code": "SA-TEST",
                "location_code": "999 K9",
                "name": "Phòng siêu âm kiểm thử",
                "department": "Chẩn đoán hình ảnh",
                "floor": "Tầng 9",
                "service_type": "ultrasound",
                "average_service_minutes": 15,
                "initial_waiting_patients": 2,
                "operational": True,
            },
        )
        assert created.status_code == 201

        adjusted = response.patch(
            "/api/v1/simulation/rooms/SA-TEST/queue",
            json={"delta": 3},
        )
        assert adjusted.status_code == 200
        room = next(
            item for item in adjusted.json()["rooms"] if item["code"] == "SA-TEST"
        )
        assert room["waiting_patients"] == 5
    finally:
        simulation_router_module.service = original_service

    reloaded = build_service(tmp_path / "simulation.db").get_snapshot()
    reloaded_room = next(room for room in reloaded.rooms if room.code == "SA-TEST")
    assert reloaded_room.waiting_patients == 5


def test_queue_cannot_be_reduced_below_zero(tmp_path: Path) -> None:
    service = build_service(tmp_path / "simulation.db")

    before = next(room for room in service.get_snapshot().rooms if room.code == "CT-301")
    after = service.adjust_room_queue("CT-301", -50)
    room = next(item for item in after.rooms if item.code == "CT-301")

    assert before.waiting_patients >= 0
    assert room.waiting_patients == 0
