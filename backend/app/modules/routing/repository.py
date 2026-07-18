import sqlite3
from pathlib import Path
from threading import RLock
from typing import Protocol

from app.modules.routing.schemas import RouteProposalResponse


class RouteProposalRepository(Protocol):
    def save(self, proposal: RouteProposalResponse) -> None: ...

    def get_by_id(self, proposal_id: str) -> RouteProposalResponse | None: ...


class SqliteRouteProposalRepository:
    """Lưu đề xuất lộ trình để backend có thể khôi phục sau khi khởi động lại."""

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
                CREATE TABLE IF NOT EXISTS route_proposals (
                    id TEXT PRIMARY KEY,
                    encounter_id TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_route_proposals_encounter
                ON route_proposals(encounter_id, updated_at DESC)
                """
            )

    def save(self, proposal: RouteProposalResponse) -> None:
        with self._lock, self._connect() as connection:
            connection.execute(
                """
                INSERT INTO route_proposals (
                    id, encounter_id, expires_at, updated_at, payload_json
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    encounter_id = excluded.encounter_id,
                    expires_at = excluded.expires_at,
                    updated_at = excluded.updated_at,
                    payload_json = excluded.payload_json
                """,
                (
                    proposal.id,
                    proposal.encounter_id,
                    proposal.expires_at.isoformat(),
                    proposal.updated_at.isoformat(),
                    proposal.model_dump_json(),
                ),
            )

    def get_by_id(self, proposal_id: str) -> RouteProposalResponse | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT payload_json FROM route_proposals WHERE id = ?",
                (proposal_id,),
            ).fetchone()
        if row is None:
            return None
        return RouteProposalResponse.model_validate_json(row["payload_json"])
