from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from threading import RLock

from app.modules.simulation.fixtures import (
    INITIAL_PATIENT_COUNT,
    PATIENT_ROUTE_PATTERNS,
    ROOM_SEEDS,
    RoomSeed,
)
from app.modules.simulation.schemas import (
    DemoPriority,
    EquipmentStatus,
    PatientSnapshot,
    RoomSnapshot,
    RoomStatus,
    SimulationEventResponse,
    SimulationEventType,
    SimulationSnapshot,
    SimulationSummary,
)
from app.shared.enums import JourneyStepStatus


@dataclass(slots=True)
class _RoomState:
    seed: RoomSeed
    operational: bool
    current_patient_code: str | None = None
    remaining_service_minutes: int = 0
    status_reason: str | None = None


@dataclass(slots=True)
class _PatientState:
    code: str
    priority: DemoPriority
    route_room_codes: tuple[str, ...]
    current_step_index: int
    status: JourneyStepStatus
    queued_at: datetime | None

    @property
    def current_room_code(self) -> str | None:
        if self.current_step_index >= len(self.route_room_codes):
            return None
        return self.route_room_codes[self.current_step_index]


class HospitalSimulationService:
    """Bộ mô phỏng xác định, lưu trong bộ nhớ và chỉ dùng cho môi trường demo."""

    data_notice = "Dữ liệu giả lập, không chứa thông tin bệnh nhân thật."

    def __init__(self) -> None:
        self._lock = RLock()
        self._rooms: dict[str, _RoomState] = {}
        self._patients: dict[str, _PatientState] = {}
        self._events: list[SimulationEventResponse] = []
        self._event_sequence = 0
        self._patient_sequence = 0
        self._tick = 0
        self._simulation_time = datetime.now(UTC).replace(microsecond=0)
        self.reset()

    def reset(self) -> SimulationSnapshot:
        with self._lock:
            self._tick = 0
            self._event_sequence = 0
            self._patient_sequence = 0
            self._simulation_time = datetime.now(UTC).replace(microsecond=0)
            self._events = []
            self._rooms = {
                seed.code: _RoomState(
                    seed=seed,
                    operational=seed.initially_operational,
                    status_reason=(
                        None
                        if seed.initially_operational
                        else "Bảo trì thiết bị theo kịch bản demo."
                    ),
                )
                for seed in ROOM_SEEDS
            }
            self._patients = {}

            for index in range(INITIAL_PATIENT_COUNT):
                route = PATIENT_ROUTE_PATTERNS[index % len(PATIENT_ROUTE_PATTERNS)]
                step_index = index % len(route)
                self._add_patient(route, step_index=step_index)

            self._record_event(
                SimulationEventType.RESET,
                "Đã khởi tạo lại kịch bản mô phỏng.",
            )
            self._start_waiting_patients()
            return self._build_snapshot()

    def get_snapshot(self) -> SimulationSnapshot:
        with self._lock:
            return self._build_snapshot()

    def advance(self, minutes: int) -> SimulationSnapshot:
        with self._lock:
            self._tick += 1
            self._simulation_time += timedelta(minutes=minutes)
            self._complete_or_progress_services(minutes)

            if self._tick % 2 == 0:
                route = PATIENT_ROUTE_PATTERNS[self._tick % len(PATIENT_ROUTE_PATTERNS)]
                patient = self._add_patient(route)
                self._record_event(
                    SimulationEventType.PATIENT_ARRIVED,
                    f"{patient.code} vừa đến và được đưa vào hàng chờ.",
                    patient_code=patient.code,
                    room_code=patient.current_room_code,
                )

            self._start_waiting_patients()
            return self._build_snapshot()

    def set_room_operation(
        self,
        room_code: str,
        *,
        operational: bool,
        reason: str | None,
    ) -> SimulationSnapshot:
        with self._lock:
            room = self._rooms.get(room_code)
            if room is None:
                raise KeyError(room_code)

            if room.operational == operational:
                return self._build_snapshot()

            room.operational = operational
            if operational:
                room.status_reason = None
                event_type = SimulationEventType.ROOM_REOPENED
                message = f"{room.seed.name} đã hoạt động trở lại."
            else:
                room.status_reason = reason or "Tạm dừng theo điều khiển mô phỏng."
                event_type = SimulationEventType.ROOM_PAUSED
                message = f"{room.seed.name} tạm dừng: {room.status_reason}"
                self._return_current_patient_to_queue(room)

            self._record_event(event_type, message, room_code=room_code)
            if operational:
                self._start_waiting_patients()
            return self._build_snapshot()

    def _add_patient(
        self,
        route_room_codes: tuple[str, ...],
        *,
        step_index: int = 0,
    ) -> _PatientState:
        self._patient_sequence += 1
        patient = _PatientState(
            code=f"DEMO-BN-{self._patient_sequence:03d}",
            priority=(
                DemoPriority.PRIORITY
                if self._patient_sequence % 7 == 0
                else DemoPriority.NORMAL
            ),
            route_room_codes=route_room_codes,
            current_step_index=step_index,
            status=JourneyStepStatus.WAITING,
            queued_at=self._simulation_time
            - timedelta(minutes=(self._patient_sequence % 6) * 3),
        )
        self._patients[patient.code] = patient
        return patient

    def _complete_or_progress_services(self, minutes: int) -> None:
        for room in self._rooms.values():
            if room.current_patient_code is None:
                continue

            room.remaining_service_minutes -= minutes
            if room.remaining_service_minutes > 0:
                continue

            patient = self._patients[room.current_patient_code]
            completed_room_code = room.seed.code
            room.current_patient_code = None
            room.remaining_service_minutes = 0
            patient.current_step_index += 1

            if patient.current_step_index >= len(patient.route_room_codes):
                patient.status = JourneyStepStatus.COMPLETED
                patient.queued_at = None
                self._record_event(
                    SimulationEventType.JOURNEY_COMPLETED,
                    f"{patient.code} đã hoàn tất toàn bộ hành trình mô phỏng.",
                    patient_code=patient.code,
                    room_code=completed_room_code,
                )
                continue

            patient.status = JourneyStepStatus.WAITING
            patient.queued_at = self._simulation_time
            self._record_event(
                SimulationEventType.SERVICE_COMPLETED,
                (
                    f"{patient.code} hoàn tất tại {completed_room_code} "
                    f"và chuyển tới {patient.current_room_code}."
                ),
                patient_code=patient.code,
                room_code=completed_room_code,
            )

    def _start_waiting_patients(self) -> None:
        for room in self._rooms.values():
            if not room.operational or room.current_patient_code is not None:
                continue

            waiting = self._waiting_patients_for_room(room.seed.code)
            if not waiting:
                continue

            patient = waiting[0]
            patient.status = JourneyStepStatus.IN_SERVICE
            patient.queued_at = None
            room.current_patient_code = patient.code
            room.remaining_service_minutes = room.seed.average_service_minutes
            self._record_event(
                SimulationEventType.SERVICE_STARTED,
                f"{patient.code} bắt đầu được phục vụ tại {room.seed.name}.",
                patient_code=patient.code,
                room_code=room.seed.code,
            )

    def _return_current_patient_to_queue(self, room: _RoomState) -> None:
        if room.current_patient_code is None:
            return
        patient = self._patients[room.current_patient_code]
        patient.status = JourneyStepStatus.WAITING
        patient.queued_at = self._simulation_time
        room.current_patient_code = None
        room.remaining_service_minutes = 0

    def _waiting_patients_for_room(self, room_code: str) -> list[_PatientState]:
        priority_order = {
            DemoPriority.PRIORITY: 0,
            DemoPriority.NORMAL: 1,
        }
        waiting = [
            patient
            for patient in self._patients.values()
            if patient.status == JourneyStepStatus.WAITING
            and patient.current_room_code == room_code
        ]
        return sorted(
            waiting,
            key=lambda patient: (
                priority_order[patient.priority],
                patient.queued_at or self._simulation_time,
                patient.code,
            ),
        )

    def _room_status(self, room: _RoomState, waiting_count: int) -> RoomStatus:
        if not room.operational:
            return RoomStatus.PAUSED
        if waiting_count >= 5:
            return RoomStatus.OVERLOADED
        if room.current_patient_code is not None:
            return RoomStatus.SERVING
        return RoomStatus.AVAILABLE

    def _build_snapshot(self) -> SimulationSnapshot:
        rooms = [self._build_room_snapshot(room) for room in self._rooms.values()]
        patients = [
            PatientSnapshot(
                code=patient.code,
                priority=patient.priority,
                status=patient.status,
                current_room_code=patient.current_room_code,
                current_step=min(patient.current_step_index + 1, len(patient.route_room_codes)),
                total_steps=len(patient.route_room_codes),
                route_room_codes=list(patient.route_room_codes),
                queued_at=patient.queued_at,
            )
            for patient in sorted(self._patients.values(), key=lambda item: item.code)
        ]
        wait_values = [
            room.estimated_wait_minutes
            for room in rooms
            if room.status != RoomStatus.PAUSED
        ]
        summary = SimulationSummary(
            total_rooms=len(rooms),
            available_rooms=sum(room.status == RoomStatus.AVAILABLE for room in rooms),
            serving_rooms=sum(room.status == RoomStatus.SERVING for room in rooms),
            overloaded_rooms=sum(room.status == RoomStatus.OVERLOADED for room in rooms),
            paused_rooms=sum(room.status == RoomStatus.PAUSED for room in rooms),
            waiting_patients=sum(
                patient.status == JourneyStepStatus.WAITING for patient in patients
            ),
            in_service_patients=sum(
                patient.status == JourneyStepStatus.IN_SERVICE for patient in patients
            ),
            completed_patients=sum(
                patient.status == JourneyStepStatus.COMPLETED for patient in patients
            ),
            average_wait_minutes=(sum(wait_values) // len(wait_values) if wait_values else 0),
            longest_wait_minutes=max(wait_values, default=0),
        )
        return SimulationSnapshot(
            scenario_id="hospital-day-demo-v1",
            data_notice=self.data_notice,
            tick=self._tick,
            simulation_time=self._simulation_time,
            updated_at=datetime.now(UTC),
            summary=summary,
            rooms=rooms,
            patients=patients,
            recent_events=list(reversed(self._events[-12:])),
        )

    def _build_room_snapshot(self, room: _RoomState) -> RoomSnapshot:
        waiting = self._waiting_patients_for_room(room.seed.code)
        waiting_count = len(waiting)
        status = self._room_status(room, waiting_count)
        estimated_wait = (
            room.remaining_service_minutes
            + waiting_count * room.seed.average_service_minutes
        )
        return RoomSnapshot(
            code=room.seed.code,
            name=room.seed.name,
            department=room.seed.department,
            floor=room.seed.floor,
            service_type=room.seed.service_type,
            status=status,
            equipment_status=(
                EquipmentStatus.OPERATIONAL
                if room.operational
                else EquipmentStatus.MAINTENANCE
            ),
            waiting_patients=waiting_count,
            waiting_patient_codes=[patient.code for patient in waiting[:6]],
            current_patient_code=room.current_patient_code,
            average_service_minutes=room.seed.average_service_minutes,
            estimated_wait_minutes=estimated_wait,
            status_reason=room.status_reason,
            updated_at=self._simulation_time,
        )

    def _record_event(
        self,
        event_type: SimulationEventType,
        message: str,
        *,
        room_code: str | None = None,
        patient_code: str | None = None,
    ) -> None:
        self._event_sequence += 1
        self._events.append(
            SimulationEventResponse(
                id=f"EVT-{self._event_sequence:05d}",
                type=event_type,
                message=message,
                occurred_at=self._simulation_time,
                room_code=room_code,
                patient_code=patient_code,
            )
        )
