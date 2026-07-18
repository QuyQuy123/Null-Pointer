import re
from dataclasses import dataclass
from itertools import permutations, product
from math import ceil

from app.modules.routing.catalog import (
    SERVICE_CATALOG,
    LockedPosition,
    ServiceDefinition,
)
from app.modules.routing.exceptions import NoFeasibleRouteError
from app.modules.routing.schemas import (
    CreateRouteProposalRequest,
    RouteLabel,
    ScheduleStrategy,
    ServiceCode,
)
from app.modules.simulation.schemas import (
    EquipmentStatus,
    RoomSnapshot,
    RoomStatus,
    SimulationSnapshot,
)
from app.shared.enums import RoutePriority

ALGORITHM_VERSION = "deterministic-routing-v1"
MAX_CANDIDATES = 200


@dataclass(frozen=True, slots=True)
class PlannedStep:
    service: ServiceDefinition
    room: RoomSnapshot
    wait_minutes_min: int
    wait_minutes_max: int
    service_minutes: int
    travel_minutes: int
    arrival_minutes: int
    complete_minutes: int
    result_ready_minutes: int


@dataclass(frozen=True, slots=True)
class RouteCandidate:
    key: str
    steps: tuple[PlannedStep, ...]
    duration_minutes_min: int
    duration_minutes_max: int
    distance_meters: int
    floor_changes: int
    total_wait_minutes: int
    tests_completed_minutes: int
    results_ready_minutes: int
    doctor_return_minutes: int | None
    is_accessible: bool


@dataclass(frozen=True, slots=True)
class RankedCandidate:
    label: RouteLabel
    candidate: RouteCandidate
    ranking_score: float
    reason: str


class DeterministicRoutingOptimizer:
    """Sinh và chấm điểm phương án bằng quy tắc có thể giải thích và kiểm thử."""

    def optimize(
        self,
        snapshot: SimulationSnapshot,
        request: CreateRouteProposalRequest,
    ) -> list[RankedCandidate]:
        candidates = self._generate_candidates(snapshot, request)
        if not candidates:
            raise NoFeasibleRouteError(
                "Không có phương án đáp ứng đầy đủ chỉ định với trạng thái phòng hiện tại."
            )

        selectors = (
            (RouteLabel.RECOMMENDED, request.priority),
            (RouteLabel.LESS_WALK, RoutePriority.LESS_WALK),
            (RouteLabel.LESS_CROWD, RoutePriority.LESS_CROWD),
        )
        selected: list[RankedCandidate] = []
        selected_keys: set[str] = set()

        for label, priority in selectors:
            ranked = sorted(
                candidates,
                key=lambda candidate: (
                    self._score(candidate, priority, request.schedule_strategy),
                    candidate.key,
                ),
            )
            candidate = next(
                (item for item in ranked if item.key not in selected_keys),
                None,
            )
            if candidate is None:
                continue

            selected_keys.add(candidate.key)
            selected.append(
                RankedCandidate(
                    label=label,
                    candidate=candidate,
                    ranking_score=round(
                        self._score(candidate, priority, request.schedule_strategy),
                        3,
                    ),
                    reason=self._build_reason(label, priority, request.schedule_strategy),
                )
            )

        return selected

    def _generate_candidates(
        self,
        snapshot: SimulationSnapshot,
        request: CreateRouteProposalRequest,
    ) -> list[RouteCandidate]:
        service_definitions = [
            SERVICE_CATALOG[service_code]
            for service_code in request.required_service_codes
        ]
        room_options = self._room_options(snapshot, service_definitions)
        sequences = self._service_sequences(service_definitions)
        candidates: list[RouteCandidate] = []

        for sequence in sequences:
            options_in_sequence = [room_options[service.code] for service in sequence]
            for selected_rooms in product(*options_in_sequence):
                candidates.append(
                    self._simulate_candidate(
                        snapshot,
                        request,
                        sequence,
                        selected_rooms,
                    )
                )
                if len(candidates) >= MAX_CANDIDATES:
                    return candidates

        return candidates

    def _room_options(
        self,
        snapshot: SimulationSnapshot,
        services: list[ServiceDefinition],
    ) -> dict[ServiceCode, list[RoomSnapshot]]:
        active_rooms = [
            room
            for room in snapshot.rooms
            if room.status != RoomStatus.PAUSED
            and room.equipment_status == EquipmentStatus.OPERATIONAL
        ]
        options: dict[ServiceCode, list[RoomSnapshot]] = {}

        for service in services:
            matching_rooms = [
                room
                for room in active_rooms
                if room.service_type == service.room_service_type
            ]
            if not matching_rooms:
                raise NoFeasibleRouteError(
                    f"Không có phòng đang hoạt động cho dịch vụ {service.name}."
                )
            options[service.code] = matching_rooms

        return options

    def _service_sequences(
        self,
        services: list[ServiceDefinition],
    ) -> list[tuple[ServiceDefinition, ...]]:
        first = [
            service
            for service in services
            if service.locked_position == LockedPosition.FIRST
        ]
        last = [
            service
            for service in services
            if service.locked_position == LockedPosition.LAST
        ]
        middle = [
            service
            for service in services
            if service.locked_position is None
        ]
        middle_orders = list(permutations(middle)) if middle else [()]
        return [tuple(first) + order + tuple(last) for order in middle_orders]

    def _simulate_candidate(
        self,
        snapshot: SimulationSnapshot,
        request: CreateRouteProposalRequest,
        sequence: tuple[ServiceDefinition, ...],
        selected_rooms: tuple[RoomSnapshot, ...],
    ) -> RouteCandidate:
        room_by_code = {room.code: room for room in snapshot.rooms}
        previous_room = room_by_code.get(request.start_room_code or "")
        elapsed_minutes = 0
        total_distance = 0
        floor_changes = 0
        total_wait = 0
        tests_completed = 0
        results_ready = 0
        doctor_return: int | None = None
        uncertainty_minutes = 0
        planned_steps: list[PlannedStep] = []

        for service, room in zip(sequence, selected_rooms, strict=True):
            distance, changed_floors = self._travel_metrics(previous_room, room)
            travel_minutes = self._travel_minutes(distance, request)
            total_distance += distance
            floor_changes += changed_floors
            arrival_minutes = elapsed_minutes + travel_minutes

            projected_queue = max(0, room.estimated_wait_minutes - arrival_minutes)
            wait_min = max(0, round(projected_queue * 0.75))
            wait_max = max(wait_min, ceil(projected_queue * 1.25) + 2)
            expected_wait = (wait_min + wait_max) // 2

            if service.locked_position == LockedPosition.LAST:
                earliest_start = max(arrival_minutes + expected_wait, results_ready)
                expected_wait = earliest_start - arrival_minutes
                wait_min = max(0, expected_wait - 2)
                wait_max = expected_wait + 3

            complete_minutes = arrival_minutes + expected_wait + room.average_service_minutes
            result_ready_minutes = complete_minutes + service.result_turnaround_minutes
            total_wait += expected_wait
            uncertainty_minutes += max(0, wait_max - wait_min)

            if service.locked_position == LockedPosition.LAST:
                doctor_return = complete_minutes
            else:
                tests_completed = max(tests_completed, complete_minutes)
                results_ready = max(results_ready, result_ready_minutes)

            planned_steps.append(
                PlannedStep(
                    service=service,
                    room=room,
                    wait_minutes_min=wait_min,
                    wait_minutes_max=wait_max,
                    service_minutes=room.average_service_minutes,
                    travel_minutes=travel_minutes,
                    arrival_minutes=arrival_minutes,
                    complete_minutes=complete_minutes,
                    result_ready_minutes=result_ready_minutes,
                )
            )
            elapsed_minutes = complete_minutes
            previous_room = room

        expected_duration = max(elapsed_minutes, results_ready)
        half_uncertainty = ceil(uncertainty_minutes / 2)
        candidate_key = "|".join(
            f"{step.service.code}:{step.room.code}" for step in planned_steps
        )
        return RouteCandidate(
            key=candidate_key,
            steps=tuple(planned_steps),
            duration_minutes_min=max(0, expected_duration - half_uncertainty),
            duration_minutes_max=expected_duration + half_uncertainty,
            distance_meters=total_distance,
            floor_changes=floor_changes,
            total_wait_minutes=total_wait,
            tests_completed_minutes=tests_completed,
            results_ready_minutes=results_ready,
            doctor_return_minutes=doctor_return,
            is_accessible=True,
        )

    def _score(
        self,
        candidate: RouteCandidate,
        priority: RoutePriority,
        strategy: ScheduleStrategy,
    ) -> float:
        expected_duration = (
            candidate.duration_minutes_min + candidate.duration_minutes_max
        ) / 2

        if strategy == ScheduleStrategy.FINISH_EARLY:
            score = (
                candidate.tests_completed_minutes * 0.5
                + candidate.results_ready_minutes * 0.35
                + expected_duration * 0.15
            )
        elif strategy == ScheduleStrategy.LEAVE_FAST:
            score = expected_duration * 0.8 + (
                candidate.doctor_return_minutes or expected_duration
            ) * 0.2
        else:
            score = (
                expected_duration * 0.5
                + candidate.results_ready_minutes * 0.2
                + candidate.total_wait_minutes * 0.15
                + candidate.distance_meters / 30
                + candidate.floor_changes * 4
            )

        if priority == RoutePriority.FASTEST:
            score += expected_duration * 0.5
        elif priority == RoutePriority.LESS_WALK:
            score += candidate.distance_meters / 6 + candidate.floor_changes * 12
        elif priority == RoutePriority.LESS_CROWD:
            score += candidate.total_wait_minutes * 1.5
        elif priority == RoutePriority.ACCESSIBLE:
            if not candidate.is_accessible:
                return float("inf")
            score += candidate.distance_meters / 8 + candidate.floor_changes * 18

        return score

    def _travel_metrics(
        self,
        previous_room: RoomSnapshot | None,
        next_room: RoomSnapshot,
    ) -> tuple[int, int]:
        if previous_room is None or previous_room.code == next_room.code:
            return 0, 0

        previous_floor = self._floor_number(previous_room.floor)
        next_floor = self._floor_number(next_room.floor)
        floor_gap = abs(previous_floor - next_floor)
        if floor_gap > 0:
            return 60 + floor_gap * 85, floor_gap

        room_gap = abs(
            self._room_number(previous_room.code) - self._room_number(next_room.code)
        )
        return 35 + min(65, room_gap // 3), 0

    def _travel_minutes(
        self,
        distance_meters: int,
        request: CreateRouteProposalRequest,
    ) -> int:
        needs_assistance = any(
            (
                request.accessibility.wheelchair,
                request.accessibility.avoid_stairs,
                request.accessibility.visual_assistance,
            )
        )
        meters_per_minute = 40 if needs_assistance else 65
        return ceil(distance_meters / meters_per_minute)

    def _floor_number(self, floor: str) -> int:
        match = re.search(r"\d+", floor)
        return int(match.group()) if match else 0

    def _room_number(self, room_code: str) -> int:
        match = re.search(r"\d+", room_code)
        return int(match.group()) if match else 0

    def _build_reason(
        self,
        label: RouteLabel,
        priority: RoutePriority,
        strategy: ScheduleStrategy,
    ) -> str:
        if label == RouteLabel.LESS_WALK:
            return "Giảm quãng đường di chuyển và số lần đổi tầng trong toàn hành trình."
        if label == RouteLabel.LESS_CROWD:
            return "Ưu tiên các phòng có tổng thời gian hàng chờ dự kiến thấp hơn."

        priority_reasons = {
            RoutePriority.SYSTEM: "Cân bằng thời gian, hàng chờ và quãng đường.",
            RoutePriority.FASTEST: "Ưu tiên hoàn tất toàn bộ hành trình sớm.",
            RoutePriority.LESS_WALK: "Ưu tiên quãng đường ngắn và ít đổi tầng.",
            RoutePriority.LESS_CROWD: "Ưu tiên khu chờ ít đông hơn.",
            RoutePriority.ACCESSIBLE: "Ưu tiên hành trình phù hợp nhu cầu hỗ trợ di chuyển.",
        }
        strategy_reasons = {
            ScheduleStrategy.BALANCED: " Chiến lược trong ngày là cân bằng.",
            ScheduleStrategy.FINISH_EARLY: " Các xét nghiệm được ưu tiên hoàn tất sớm.",
            ScheduleStrategy.LEAVE_FAST: " Tổng thời gian ở bệnh viện được ưu tiên rút ngắn.",
        }
        return priority_reasons[priority] + strategy_reasons[strategy]
