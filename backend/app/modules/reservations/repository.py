import sqlite3
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from threading import RLock
from typing import Protocol

from app.modules.reservations.schemas import JourneyStatus, ReservationStatus


@dataclass(slots=True)
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
    patient_code: str | None = None
    clinical_order_id: str | None = None
    current_step: int = 0
    journey_status: JourneyStatus = JourneyStatus.NOT_STARTED


class RouteReservationRepository(Protocol):
    def save(self, record: ReservationRecord) -> None: ...

    def get_by_id(self, reservation_id: str) -> ReservationRecord | None: ...

    def get_by_idempotency_key(self, key: str) -> ReservationRecord | None: ...

    def get_latest_for_patient(self, patient_code: str) -> ReservationRecord | None: ...

    def clear(self) -> None: ...


class InMemoryRouteReservationRepository:
    def __init__(self) -> None:
        self._records: dict[str, ReservationRecord] = {}

    def save(self, record: ReservationRecord) -> None:
        self._records[record.id] = record

    def get_by_id(self, reservation_id: str) -> ReservationRecord | None:
        return self._records.get(reservation_id)

    def get_by_idempotency_key(self, key: str) -> ReservationRecord | None:
        matches = [record for record in self._records.values() if record.idempotency_key == key]
        return max(matches, key=lambda item: item.created_at, default=None)

    def get_latest_for_patient(self, patient_code: str) -> ReservationRecord | None:
        matches = [
            record for record in self._records.values() if record.patient_code == patient_code
        ]
        return max(matches, key=lambda item: item.created_at, default=None)

    def clear(self) -> None:
        self._records.clear()


class SqliteRouteReservationRepository:
    """Lưu giữ chỗ và tiến độ hành trình trong cùng cơ sở dữ liệu backend."""

    def __init__(self, database_path: Path) -> None:
        self._database_path = database_path
        self._lock = RLock()
        self._database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self._database_path, timeout=10)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS route_reservations (
                    id TEXT PRIMARY KEY,
                    encounter_id TEXT NOT NULL,
                    route_proposal_id TEXT NOT NULL,
                    route_option_id TEXT NOT NULL,
                    idempotency_key TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    confirmed_at TEXT,
                    journey_id TEXT,
                    extension_count INTEGER NOT NULL,
                    patient_code TEXT,
                    clinical_order_id TEXT,
                    current_step INTEGER NOT NULL DEFAULT 0,
                    journey_status TEXT NOT NULL DEFAULT 'not_started'
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_reservations_patient_created
                ON route_reservations(patient_code, created_at DESC)
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_reservations_idempotency
                ON route_reservations(idempotency_key, created_at DESC)
                """
            )

    def save(self, record: ReservationRecord) -> None:
        with self._lock, self._connect() as connection:
            connection.execute(
                """
                INSERT INTO route_reservations (
                    id, encounter_id, route_proposal_id, route_option_id,
                    idempotency_key, status, created_at, expires_at, confirmed_at,
                    journey_id, extension_count, patient_code, clinical_order_id,
                    current_step, journey_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    status = excluded.status,
                    expires_at = excluded.expires_at,
                    confirmed_at = excluded.confirmed_at,
                    journey_id = excluded.journey_id,
                    extension_count = excluded.extension_count,
                    patient_code = excluded.patient_code,
                    clinical_order_id = excluded.clinical_order_id,
                    current_step = excluded.current_step,
                    journey_status = excluded.journey_status
                """,
                (
                    record.id,
                    record.encounter_id,
                    record.route_proposal_id,
                    record.route_option_id,
                    record.idempotency_key,
                    record.status.value,
                    record.created_at.isoformat(),
                    record.expires_at.isoformat(),
                    record.confirmed_at.isoformat() if record.confirmed_at else None,
                    record.journey_id,
                    record.extension_count,
                    record.patient_code,
                    record.clinical_order_id,
                    record.current_step,
                    record.journey_status.value,
                ),
            )

    def get_by_id(self, reservation_id: str) -> ReservationRecord | None:
        return self._get_one("WHERE id = ?", (reservation_id,))

    def get_by_idempotency_key(self, key: str) -> ReservationRecord | None:
        return self._get_one(
            "WHERE idempotency_key = ? ORDER BY created_at DESC LIMIT 1",
            (key,),
        )

    def get_latest_for_patient(self, patient_code: str) -> ReservationRecord | None:
        return self._get_one(
            "WHERE patient_code = ? ORDER BY created_at DESC LIMIT 1",
            (patient_code,),
        )

    def clear(self) -> None:
        with self._lock, self._connect() as connection:
            connection.execute("DELETE FROM route_reservations")

    def _get_one(self, suffix: str, parameters: tuple[str, ...]) -> ReservationRecord | None:
        with self._connect() as connection:
            row = connection.execute(
                f"SELECT * FROM route_reservations {suffix}",
                parameters,
            ).fetchone()
        return None if row is None else self._to_record(row)

    @staticmethod
    def _to_record(row: sqlite3.Row) -> ReservationRecord:
        return ReservationRecord(
            id=row["id"],
            encounter_id=row["encounter_id"],
            route_proposal_id=row["route_proposal_id"],
            route_option_id=row["route_option_id"],
            idempotency_key=row["idempotency_key"],
            status=ReservationStatus(row["status"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            expires_at=datetime.fromisoformat(row["expires_at"]),
            confirmed_at=(
                datetime.fromisoformat(row["confirmed_at"])
                if row["confirmed_at"]
                else None
            ),
            journey_id=row["journey_id"],
            extension_count=row["extension_count"],
            patient_code=row["patient_code"],
            clinical_order_id=row["clinical_order_id"],
            current_step=row["current_step"],
            journey_status=JourneyStatus(row["journey_status"]),
        )
