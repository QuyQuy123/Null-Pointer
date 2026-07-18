from collections.abc import Mapping
from datetime import UTC, datetime, timedelta
from threading import RLock
from uuid import uuid4

from app.intelligence.safety_validator import validate_required_services
from app.modules.routing.catalog import ServiceDefinition
from app.modules.routing.exceptions import (
    RouteOptionNotFoundError,
    RouteProposalExpiredError,
    RouteProposalNotFoundError,
)
from app.modules.routing.optimizer import (
    ALGORITHM_VERSION,
    DeterministicRoutingOptimizer,
    RankedCandidate,
)
from app.modules.routing.repository import RouteProposalRepository
from app.modules.routing.schemas import (
    CreateRouteProposalRequest,
    RouteOptionResponse,
    RouteProposalResponse,
    RouteStepResponse,
    ServiceCode,
)
from app.modules.simulation.runtime import simulation_service
from app.modules.simulation.service import HospitalSimulationService


class RouteProposalService:
    """Tạo phương án từ chỉ định và trạng thái phòng đã được backend kiểm tra."""

    def __init__(
        self,
        simulation: HospitalSimulationService | None = None,
        optimizer: DeterministicRoutingOptimizer | None = None,
        repository: RouteProposalRepository | None = None,
    ) -> None:
        self._simulation = simulation or simulation_service
        self._optimizer = optimizer or DeterministicRoutingOptimizer()
        self._repository = repository
        self._proposals: dict[str, RouteProposalResponse] = {}
        self._lock = RLock()

    def create_proposal(
        self,
        encounter_id: str,
        request: CreateRouteProposalRequest,
        *,
        service_catalog: Mapping[ServiceCode, ServiceDefinition] | None = None,
        allowed_room_locations: Mapping[ServiceCode, frozenset[str]] | None = None,
    ) -> RouteProposalResponse:
        snapshot = self._simulation.get_snapshot()
        ranked_candidates = self._optimizer.optimize(
            snapshot,
            request,
            service_catalog=service_catalog,
            allowed_room_locations=allowed_room_locations,
        )
        options = [
            self._to_response(ranked_candidate)
            for ranked_candidate in ranked_candidates
        ]
        required_codes = {code.value for code in request.required_service_codes}
        for option in options:
            validate_required_services(option, required_codes)

        now = datetime.now(UTC)
        paused_rooms = [
            room.name for room in snapshot.rooms if room.status.value == "paused"
        ]
        warnings = [snapshot.data_notice]
        if paused_rooms:
            warnings.append(
                "Đã loại phòng tạm dừng khỏi phương án: " + ", ".join(paused_rooms)
            )

        proposal = RouteProposalResponse(
            id=str(uuid4()),
            encounter_id=encounter_id,
            priority=request.priority,
            schedule_strategy=request.schedule_strategy,
            required_service_codes=request.required_service_codes,
            is_demo=True,
            algorithm_version=ALGORITHM_VERSION,
            simulation_tick=snapshot.tick,
            updated_at=snapshot.updated_at,
            expires_at=now + timedelta(minutes=3),
            warnings=warnings,
            options=options,
        )
        with self._lock:
            self._remove_expired_proposals(now)
            self._proposals[proposal.id] = proposal
            if self._repository is not None:
                self._repository.save(proposal)
        return proposal

    def get_valid_option(
        self,
        proposal_id: str,
        option_id: str,
        encounter_id: str,
    ) -> tuple[RouteProposalResponse, RouteOptionResponse]:
        """Trả phương án còn hiệu lực để dịch vụ giữ chỗ kiểm tra lại."""
        now = datetime.now(UTC)
        with self._lock:
            proposal = self._proposals.get(proposal_id)
            if proposal is None and self._repository is not None:
                proposal = self._repository.get_by_id(proposal_id)
                if proposal is not None:
                    self._proposals[proposal.id] = proposal
            if proposal is None or proposal.encounter_id != encounter_id:
                raise RouteProposalNotFoundError("Không tìm thấy đề xuất lộ trình")
            if proposal.expires_at <= now:
                self._proposals.pop(proposal_id, None)
                raise RouteProposalExpiredError("Đề xuất lộ trình đã hết hạn")
            option = next((item for item in proposal.options if item.id == option_id), None)
            if option is None:
                raise RouteOptionNotFoundError("Phương án không thuộc đề xuất lộ trình")
            return proposal, option

    def _remove_expired_proposals(self, now: datetime) -> None:
        expired_ids = [
            proposal_id
            for proposal_id, proposal in self._proposals.items()
            if proposal.expires_at <= now
        ]
        for proposal_id in expired_ids:
            self._proposals.pop(proposal_id, None)

    def create_demo_proposal(
        self,
        encounter_id: str,
        request: CreateRouteProposalRequest,
    ) -> RouteProposalResponse:
        """Giữ tương thích với mã gọi cũ trong giai đoạn chuyển đổi."""
        return self.create_proposal(encounter_id, request)

    def _to_response(self, ranked: RankedCandidate) -> RouteOptionResponse:
        candidate = ranked.candidate
        steps = [
            RouteStepResponse(
                id=str(uuid4()),
                order=index + 1,
                service_code=step.service.code,
                service_name=step.service.name,
                room_code=step.room.code,
                room_name=step.room.name,
                floor=step.room.floor,
                wait_minutes_min=step.wait_minutes_min,
                wait_minutes_max=step.wait_minutes_max,
                service_minutes=step.service_minutes,
                travel_minutes=step.travel_minutes,
                arrival_minutes=step.arrival_minutes,
                complete_minutes=step.complete_minutes,
                result_ready_minutes=step.result_ready_minutes,
                is_locked=step.service.locked_position is not None,
                lock_reason=step.service.lock_reason,
            )
            for index, step in enumerate(candidate.steps)
        ]
        return RouteOptionResponse(
            id=str(uuid4()),
            label=ranked.label,
            duration_minutes_min=candidate.duration_minutes_min,
            duration_minutes_max=candidate.duration_minutes_max,
            distance_meters=candidate.distance_meters,
            floor_changes=candidate.floor_changes,
            total_wait_minutes=candidate.total_wait_minutes,
            tests_completed_minutes=candidate.tests_completed_minutes,
            results_ready_minutes=candidate.results_ready_minutes,
            doctor_return_minutes=candidate.doctor_return_minutes,
            ranking_score=ranked.ranking_score,
            is_accessible=candidate.is_accessible,
            reason=ranked.reason,
            steps=steps,
        )
