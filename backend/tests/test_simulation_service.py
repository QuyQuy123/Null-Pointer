from app.modules.simulation.schemas import RoomStatus, SimulationEventType
from app.modules.simulation.service import HospitalSimulationService


def test_reset_creates_rooms_patients_and_mixed_room_statuses() -> None:
    service = HospitalSimulationService()

    snapshot = service.get_snapshot()

    assert snapshot.is_demo is True
    assert snapshot.summary.total_rooms == 11
    assert len(snapshot.patients) == 24
    assert snapshot.summary.paused_rooms == 1
    assert snapshot.summary.waiting_patients > 0
    assert snapshot.summary.in_service_patients > 0


def test_advance_moves_simulation_clock_and_patient_flows() -> None:
    service = HospitalSimulationService()
    before = service.get_snapshot()

    after = service.advance(30)

    assert after.tick == before.tick + 1
    assert after.simulation_time > before.simulation_time
    assert any(
        event.type
        in {
            SimulationEventType.SERVICE_COMPLETED,
            SimulationEventType.JOURNEY_COMPLETED,
        }
        for event in after.recent_events
    )


def test_pause_and_reopen_room_changes_operational_status() -> None:
    service = HospitalSimulationService()

    paused = service.set_room_operation(
        "XN-101",
        operational=False,
        reason="Giả lập mất kết nối thiết bị.",
    )
    paused_room = next(room for room in paused.rooms if room.code == "XN-101")

    reopened = service.set_room_operation("XN-101", operational=True, reason=None)
    reopened_room = next(room for room in reopened.rooms if room.code == "XN-101")

    assert paused_room.status == RoomStatus.PAUSED
    assert paused_room.status_reason == "Giả lập mất kết nối thiết bị."
    assert reopened_room.status != RoomStatus.PAUSED
