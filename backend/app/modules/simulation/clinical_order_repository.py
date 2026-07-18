import sqlite3
from pathlib import Path
from threading import RLock

from app.modules.simulation.clinical_order_schemas import (
    ClinicalOrderDispatchResponse,
)


class SqliteClinicalOrderRepository:
    """Lưu phong bì chỉ định giả lập để màn hình bệnh nhân có thể nhận lại."""

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
                CREATE TABLE IF NOT EXISTS simulation_clinical_orders (
                    id TEXT PRIMARY KEY,
                    patient_code TEXT NOT NULL,
                    encounter_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_simulation_orders_patient_created
                ON simulation_clinical_orders(patient_code, created_at DESC)
                """
            )

    def save(self, order: ClinicalOrderDispatchResponse) -> None:
        with self._lock, self._connect() as connection:
            connection.execute(
                """
                INSERT INTO simulation_clinical_orders (
                    id, patient_code, encounter_id, created_at, payload_json
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (
                    order.id,
                    order.patient_code,
                    order.encounter_id,
                    order.created_at.isoformat(),
                    order.model_dump_json(),
                ),
            )

    def get_latest(self, patient_code: str) -> ClinicalOrderDispatchResponse | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT payload_json
                FROM simulation_clinical_orders
                WHERE patient_code = ?
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (patient_code,),
            ).fetchone()
        if row is None:
            return None
        return ClinicalOrderDispatchResponse.model_validate_json(row["payload_json"])
