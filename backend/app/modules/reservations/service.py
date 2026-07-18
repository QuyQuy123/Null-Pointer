from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from threading import RLock
from uuid import uuid4

from app.modules.reservations.exceptions import (
    ReservationExpiredError,
    ReservationNotFoundError,
    ReservationStateError,
)
from app.modules.reservations.schemas import (
    CreateRouteReservationRequest,
    ReservationStatus,
    RouteReservationResponse,
)
from app.modules.routing.runtime import route_proposal_service
from app.modules.routing.service import RouteProposalService


@dataclass
class ReservationRecord:
    id: str
    encounter_id: str
    route_proposal_id: str
    route_option_id: str
    idempotency_key: str
    status: ReservationStatus
    created_at: datetime
    expires_at: datetime
    confirmed_at: datetime | None = None
    journey_id: str | None = None
    extension_count: int = 0


class RouteReservationService:
    """Giữ chỗ demo có khóa đồng thời và xác nhận lặp an toàn."""

    def __init__(
        self,
        proposal_service: RouteProposalService | None = None,
        hold_seconds: int = 120,
    ) -> None:
        self._proposal_service = proposal_service or route_proposal_service
        self._hold_seconds = hold_seconds
        self._records: dict[str, ReservationRecord] = {}
        self._idempotency_index: dict[str, str] = {}
        self._lock = RLock()

    def create_hold(
        self,
        request: CreateRouteReservationRequest,
    ) -> RouteReservationResponse:
        now = datetime.now(UTC)
        with self._lock:
            existing_id = self._idempotency_index.get(request.idempotency_key)
            if existing_id is not None:
                existing = self._records[existing_id]
                self._expire_if_needed(existing, now)
                if existing.status in {
                    ReservationStatus.HELD,
                    ReservationStatus.CONFIRMED,
                }:
                    return self._to_response(existing)

            self._proposal_service.get_valid_option(
                request.route_proposal_id,
                request.route_option_id,
                request.encounter_id,
            )
            record = ReservationRecord(
                id=str(uuid4()),
                encounter_id=request.encounter_id,
                route_proposal_id=request.route_proposal_id,
                route_option_id=request.route_option_id,
                idempotency_key=request.idempotency_key,
                status=ReservationStatus.HELD,
                created_at=now,
                expires_at=now + timedelta(seconds=self._hold_seconds),
            )
            self._records[record.id] = record
            self._idempotency_index[request.idempotency_key] = record.id
            return self._to_response(record)

    def confirm(self, reservation_id: str) -> RouteReservationResponse:
        now = datetime.now(UTC)
        with self._lock:
            record = self._get_record(reservation_id)
            self._expire_if_needed(record, now)
            if record.status is ReservationStatus.CONFIRMED:
                return self._to_response(record)
            if record.status is ReservationStatus.EXPIRED:
                raise ReservationExpiredError("Chỗ giữ đã hết hạn")
            if record.status is not ReservationStatus.HELD:
                raise ReservationStateError("Chỗ giữ không còn ở trạng thái có thể xác nhận")
            record.status = ReservationStatus.CONFIRMED
            record.confirmed_at = now
            record.journey_id = record.journey_id or f"journey-{uuid4()}"
            return self._to_response(record)

    def extend(self, reservation_id: str) -> RouteReservationResponse:
        now = datetime.now(UTC)
        with self._lock:
            record = self._get_record(reservation_id)
            self._expire_if_needed(record, now)
            if record.status is ReservationStatus.EXPIRED:
                raise ReservationExpiredError("Chỗ giữ đã hết hạn")
            if record.status is not ReservationStatus.HELD:
                raise ReservationStateError("Chỉ có thể gia hạn chỗ đang được giữ")
            if record.extension_count >= 1:
                raise ReservationStateError("Bản demo chỉ cho phép gia hạn một lần")
            record.extension_count += 1
            record.expires_at = max(now, record.expires_at) + timedelta(
                seconds=self._hold_seconds
            )
            return self._to_response(record)

    def reset(self) -> None:
        with self._lock:
            self._records.clear()
            self._idempotency_index.clear()

    def _get_record(self, reservation_id: str) -> ReservationRecord:
        record = self._records.get(reservation_id)
        if record is None:
            raise ReservationNotFoundError("Không tìm thấy lượt giữ chỗ")
        return record

    @staticmethod
    def _expire_if_needed(record: ReservationRecord, now: datetime) -> None:
        if record.status is ReservationStatus.HELD and record.expires_at <= now:
            record.status = ReservationStatus.EXPIRED

    @staticmethod
    def _to_response(record: ReservationRecord) -> RouteReservationResponse:
        return RouteReservationResponse(
            id=record.id,
            encounter_id=record.encounter_id,
            route_proposal_id=record.route_proposal_id,
            route_option_id=record.route_option_id,
            status=record.status,
            is_demo=True,
            created_at=record.created_at,
            expires_at=record.expires_at,
            confirmed_at=record.confirmed_at,
            journey_id=record.journey_id,
            extension_count=record.extension_count,
        )
