import json
import sqlite3
from pathlib import Path
from threading import RLock

from app.modules.clinical_orders.entities import (
    ClinicalServiceDefinition,
    ClinicalServiceGroup,
    FastingPolicy,
    RoomServiceType,
    SchedulingPriority,
)


def sqlite_path_from_url(database_url: str) -> Path:
    prefix = "sqlite:///"
    if not database_url.startswith(prefix):
        raise ValueError("Bộ giả lập hiện chỉ hỗ trợ DATABASE_URL sử dụng SQLite.")
    return Path(database_url.removeprefix(prefix)).resolve()


class SqliteClinicalServiceRepository:
    """Bộ lưu giả lập bền vững; có thể thay bằng bộ kết nối HIS/LIS/RIS thật."""

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
                CREATE TABLE IF NOT EXISTS simulation_clinical_services (
                    code TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    service_group TEXT NOT NULL,
                    room_service_type TEXT NOT NULL,
                    description TEXT,
                    execution_minutes_min INTEGER NOT NULL,
                    execution_minutes_max INTEGER NOT NULL,
                    turnaround_minutes_min INTEGER NOT NULL,
                    turnaround_minutes_max INTEGER NOT NULL,
                    fasting_policy TEXT NOT NULL,
                    fasting_hours_min INTEGER,
                    fasting_hours_max INTEGER,
                    scheduling_priority TEXT NOT NULL,
                    notes TEXT,
                    room_locations_json TEXT NOT NULL,
                    active INTEGER NOT NULL,
                    version INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            columns = {
                row["name"]
                for row in connection.execute(
                    "PRAGMA table_info(simulation_clinical_services)"
                ).fetchall()
            }
            if "room_service_type" not in columns:
                connection.execute(
                    """
                    ALTER TABLE simulation_clinical_services
                    ADD COLUMN room_service_type TEXT NOT NULL DEFAULT 'blood_test'
                    """
                )
            connection.execute(
                """
                UPDATE simulation_clinical_services
                SET room_service_type = 'urine_test'
                WHERE code = 'LAB-URINE'
                """
            )

    def count(self) -> int:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT COUNT(*) AS total FROM simulation_clinical_services"
            ).fetchone()
        return int(row["total"])

    def list_all(self) -> list[ClinicalServiceDefinition]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT * FROM simulation_clinical_services
                ORDER BY active DESC, service_group, name
                """
            ).fetchall()
        return [self._to_entity(row) for row in rows]

    def get_by_code(self, code: str) -> ClinicalServiceDefinition | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT * FROM simulation_clinical_services WHERE code = ?",
                (code,),
            ).fetchone()
        return self._to_entity(row) if row is not None else None

    def create(self, service: ClinicalServiceDefinition) -> None:
        values = self._to_values(service)
        with self._lock, self._connect() as connection:
            connection.execute(
                """
                INSERT INTO simulation_clinical_services (
                    code, name, service_group, room_service_type, description,
                    execution_minutes_min, execution_minutes_max,
                    turnaround_minutes_min, turnaround_minutes_max,
                    fasting_policy, fasting_hours_min, fasting_hours_max,
                    scheduling_priority, notes, room_locations_json,
                    active, version, created_at, updated_at
                ) VALUES (
                    :code, :name, :service_group, :room_service_type, :description,
                    :execution_minutes_min, :execution_minutes_max,
                    :turnaround_minutes_min, :turnaround_minutes_max,
                    :fasting_policy, :fasting_hours_min, :fasting_hours_max,
                    :scheduling_priority, :notes, :room_locations_json,
                    :active, :version, :created_at, :updated_at
                )
                """,
                values,
            )

    def update(
        self,
        service: ClinicalServiceDefinition,
        *,
        expected_version: int,
    ) -> bool:
        values = self._to_values(service) | {"expected_version": expected_version}
        with self._lock, self._connect() as connection:
            cursor = connection.execute(
                """
                UPDATE simulation_clinical_services SET
                    name = :name,
                    service_group = :service_group,
                    room_service_type = :room_service_type,
                    description = :description,
                    execution_minutes_min = :execution_minutes_min,
                    execution_minutes_max = :execution_minutes_max,
                    turnaround_minutes_min = :turnaround_minutes_min,
                    turnaround_minutes_max = :turnaround_minutes_max,
                    fasting_policy = :fasting_policy,
                    fasting_hours_min = :fasting_hours_min,
                    fasting_hours_max = :fasting_hours_max,
                    scheduling_priority = :scheduling_priority,
                    notes = :notes,
                    room_locations_json = :room_locations_json,
                    active = :active,
                    version = :version,
                    updated_at = :updated_at
                WHERE code = :code AND version = :expected_version
                """,
                values,
            )
        return cursor.rowcount == 1

    def _to_values(self, service: ClinicalServiceDefinition) -> dict[str, object]:
        if service.created_at is None or service.updated_at is None:
            raise ValueError("Dịch vụ phải có thời điểm tạo và cập nhật.")
        return {
            "code": service.code,
            "name": service.name,
            "service_group": service.service_group.value,
            "room_service_type": service.room_service_type.value,
            "description": service.description,
            "execution_minutes_min": service.execution_minutes_min,
            "execution_minutes_max": service.execution_minutes_max,
            "turnaround_minutes_min": service.turnaround_minutes_min,
            "turnaround_minutes_max": service.turnaround_minutes_max,
            "fasting_policy": service.fasting_policy.value,
            "fasting_hours_min": service.fasting_hours_min,
            "fasting_hours_max": service.fasting_hours_max,
            "scheduling_priority": service.scheduling_priority.value,
            "notes": service.notes,
            "room_locations_json": json.dumps(
                service.room_locations,
                ensure_ascii=False,
            ),
            "active": int(service.active),
            "version": service.version,
            "created_at": service.created_at.isoformat(),
            "updated_at": service.updated_at.isoformat(),
        }

    def _to_entity(self, row: sqlite3.Row) -> ClinicalServiceDefinition:
        from datetime import datetime

        return ClinicalServiceDefinition(
            code=row["code"],
            name=row["name"],
            service_group=ClinicalServiceGroup(row["service_group"]),
            room_service_type=RoomServiceType(row["room_service_type"]),
            description=row["description"],
            execution_minutes_min=row["execution_minutes_min"],
            execution_minutes_max=row["execution_minutes_max"],
            turnaround_minutes_min=row["turnaround_minutes_min"],
            turnaround_minutes_max=row["turnaround_minutes_max"],
            fasting_policy=FastingPolicy(row["fasting_policy"]),
            fasting_hours_min=row["fasting_hours_min"],
            fasting_hours_max=row["fasting_hours_max"],
            scheduling_priority=SchedulingPriority(row["scheduling_priority"]),
            notes=row["notes"],
            room_locations=tuple(json.loads(row["room_locations_json"])),
            active=bool(row["active"]),
            version=row["version"],
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )
