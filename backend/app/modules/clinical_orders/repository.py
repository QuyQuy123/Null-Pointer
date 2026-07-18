from typing import Protocol

from app.modules.clinical_orders.entities import ClinicalServiceDefinition


class ClinicalServiceRepository(Protocol):
    """Cổng dữ liệu có thể được cấp bởi bộ giả lập hoặc hệ thống bệnh viện thật."""

    def count(self) -> int: ...

    def list_all(self) -> list[ClinicalServiceDefinition]: ...

    def get_by_code(self, code: str) -> ClinicalServiceDefinition | None: ...

    def create(self, service: ClinicalServiceDefinition) -> None: ...

    def update(
        self,
        service: ClinicalServiceDefinition,
        *,
        expected_version: int,
    ) -> bool: ...
