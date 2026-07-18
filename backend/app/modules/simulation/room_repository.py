import sqlite3
from dataclasses import dataclass
from pathlib import Path
from threading import RLock
from typing import Protocol

from app.modules.simulation.fixtures import ROOM_SEEDS, RoomSeed


class SimulationRoomConflictError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class StoredSimulationRoom:
    seed: RoomSeed
    operational: bool
    manual_waiting_patients: int
    status_reason: str | None


class SimulationRoomRepository(Protocol):
    def list_rooms(self) -> list[StoredSimulationRoom]: ...

    def create_room(self, room: StoredSimulationRoom) -> StoredSimulationRoom: ...

    def update_operation(
        self,
        room_code: str,
        *,
        operational: bool,
        status_reason: str | None,
    ) -> None: ...

    def update_manual_waiting(self, room_code: str, waiting_patients: int) -> None: ...


class SqliteSimulationRoomRepository:
    """Lưu cấu hình phòng giả lập để dữ liệu không mất khi khởi động lại backend."""

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
                CREATE TABLE IF NOT EXISTS simulation_rooms (
                    code TEXT PRIMARY KEY,
                    location_code TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    department TEXT NOT NULL,
                    floor TEXT NOT NULL,
                    service_type TEXT NOT NULL,
                    average_service_minutes INTEGER NOT NULL,
                    operational INTEGER NOT NULL,
                    manual_waiting_patients INTEGER NOT NULL DEFAULT 0,
                    status_reason TEXT
                )
                """
            )
            existing = connection.execute(
                "SELECT COUNT(*) AS total FROM simulation_rooms"
            ).fetchone()
            if existing is not None and existing["total"] == 0:
                connection.executemany(
                    """
                    INSERT INTO simulation_rooms (
                        code, location_code, name, department, floor, service_type,
                        average_service_minutes, operational, manual_waiting_patients,
                        status_reason
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                    """,
                    [
                        (
                            seed.code,
                            seed.location_code or seed.code,
                            seed.name,
                            seed.department,
                            seed.floor,
                            seed.service_type,
                            seed.average_service_minutes,
                            int(seed.initially_operational),
                            (
                                None
                                if seed.initially_operational
                                else "Bảo trì thiết bị theo kịch bản demo."
                            ),
                        )
                        for seed in ROOM_SEEDS
                    ],
                )

    def list_rooms(self) -> list[StoredSimulationRoom]:
        with self._lock, self._connect() as connection:
            rows = connection.execute(
                "SELECT * FROM simulation_rooms ORDER BY floor, location_code"
            ).fetchall()
        return [self._to_record(row) for row in rows]

    def create_room(self, room: StoredSimulationRoom) -> StoredSimulationRoom:
        seed = room.seed
        try:
            with self._lock, self._connect() as connection:
                connection.execute(
                    """
                    INSERT INTO simulation_rooms (
                        code, location_code, name, department, floor, service_type,
                        average_service_minutes, operational, manual_waiting_patients,
                        status_reason
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        seed.code,
                        seed.location_code or seed.code,
                        seed.name,
                        seed.department,
                        seed.floor,
                        seed.service_type,
                        seed.average_service_minutes,
                        int(room.operational),
                        room.manual_waiting_patients,
                        room.status_reason,
                    ),
                )
        except sqlite3.IntegrityError as error:
            raise SimulationRoomConflictError(
                "Mã phòng hoặc vị trí phòng đã tồn tại."
            ) from error
        return room

    def update_operation(
        self,
        room_code: str,
        *,
        operational: bool,
        status_reason: str | None,
    ) -> None:
        with self._lock, self._connect() as connection:
            cursor = connection.execute(
                """
                UPDATE simulation_rooms
                SET operational = ?, status_reason = ?
                WHERE code = ?
                """,
                (int(operational), status_reason, room_code),
            )
            if cursor.rowcount == 0:
                raise KeyError(room_code)

    def update_manual_waiting(self, room_code: str, waiting_patients: int) -> None:
        with self._lock, self._connect() as connection:
            cursor = connection.execute(
                """
                UPDATE simulation_rooms
                SET manual_waiting_patients = ?
                WHERE code = ?
                """,
                (waiting_patients, room_code),
            )
            if cursor.rowcount == 0:
                raise KeyError(room_code)

    @staticmethod
    def _to_record(row: sqlite3.Row) -> StoredSimulationRoom:
        operational = bool(row["operational"])
        seed = RoomSeed(
            code=row["code"],
            location_code=row["location_code"],
            name=row["name"],
            department=row["department"],
            floor=row["floor"],
            service_type=row["service_type"],
            average_service_minutes=row["average_service_minutes"],
            initially_operational=operational,
        )
        return StoredSimulationRoom(
            seed=seed,
            operational=operational,
            manual_waiting_patients=row["manual_waiting_patients"],
            status_reason=row["status_reason"],
        )
