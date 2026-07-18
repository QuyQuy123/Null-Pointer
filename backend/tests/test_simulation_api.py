from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_and_advance_simulation() -> None:
    reset_response = client.post("/api/v1/simulation/reset")
    assert reset_response.status_code == 200

    snapshot_response = client.get("/api/v1/simulation/snapshot")
    assert snapshot_response.status_code == 200
    assert snapshot_response.json()["is_demo"] is True

    advance_response = client.post(
        "/api/v1/simulation/advance",
        json={"minutes": 5},
    )
    assert advance_response.status_code == 200
    assert advance_response.json()["tick"] == 1


def test_room_operation_returns_not_found_for_unknown_room() -> None:
    response = client.patch(
        "/api/v1/simulation/rooms/UNKNOWN",
        json={"operational": False, "reason": "Kiểm thử"},
    )

    assert response.status_code == 404
