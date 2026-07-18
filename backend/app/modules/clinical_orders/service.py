from dataclasses import asdict, replace
from datetime import UTC, datetime

from app.modules.clinical_orders.entities import (
    ClinicalServiceDefinition,
    ClinicalServiceInput,
)
from app.modules.clinical_orders.exceptions import (
    ClinicalServiceConflictError,
    ClinicalServiceNotFoundError,
)
from app.modules.clinical_orders.repository import ClinicalServiceRepository


class ClinicalServiceCatalogService:
    """Nghiệp vụ danh mục dùng chung, không phụ thuộc nguồn dữ liệu cụ thể."""

    def __init__(self, repository: ClinicalServiceRepository) -> None:
        self._repository = repository

    def seed_if_empty(self, seeds: tuple[ClinicalServiceInput, ...]) -> None:
        if self._repository.count() > 0:
            return
        for seed in seeds:
            self.create(seed)

    def list_services(
        self,
        *,
        include_inactive: bool = False,
    ) -> list[ClinicalServiceDefinition]:
        services = self._repository.list_all()
        if include_inactive:
            return services
        return [service for service in services if service.active]

    def get_service(self, code: str) -> ClinicalServiceDefinition:
        service = self._repository.get_by_code(code.upper())
        if service is None:
            raise ClinicalServiceNotFoundError(code)
        return service

    def create(self, data: ClinicalServiceInput) -> ClinicalServiceDefinition:
        normalized_code = data.code.upper()
        if self._repository.get_by_code(normalized_code) is not None:
            raise ClinicalServiceConflictError(
                f"Mã dịch vụ {normalized_code} đã tồn tại."
            )

        now = datetime.now(UTC)
        service = ClinicalServiceDefinition(
            **asdict(replace(data, code=normalized_code)),
            version=1,
            created_at=now,
            updated_at=now,
        )
        self._repository.create(service)
        return service

    def update(
        self,
        code: str,
        data: ClinicalServiceInput,
        *,
        expected_version: int,
    ) -> ClinicalServiceDefinition:
        current = self.get_service(code)
        if current.version != expected_version:
            raise ClinicalServiceConflictError(
                "Dữ liệu đã được người khác cập nhật. Hãy tải lại trước khi lưu."
            )

        service = ClinicalServiceDefinition(
            **asdict(replace(data, code=current.code)),
            version=current.version + 1,
            created_at=current.created_at,
            updated_at=datetime.now(UTC),
        )
        if not self._repository.update(service, expected_version=expected_version):
            raise ClinicalServiceConflictError(
                "Dữ liệu vừa thay đổi trong lúc lưu. Hãy tải lại và thử lại."
            )
        return service

    def deactivate(
        self,
        code: str,
        *,
        expected_version: int,
    ) -> ClinicalServiceDefinition:
        current = self.get_service(code)
        data = ClinicalServiceInput(
            code=current.code,
            name=current.name,
            service_group=current.service_group,
            room_service_type=current.room_service_type,
            description=current.description,
            execution_minutes_min=current.execution_minutes_min,
            execution_minutes_max=current.execution_minutes_max,
            turnaround_minutes_min=current.turnaround_minutes_min,
            turnaround_minutes_max=current.turnaround_minutes_max,
            fasting_policy=current.fasting_policy,
            fasting_hours_min=current.fasting_hours_min,
            fasting_hours_max=current.fasting_hours_max,
            scheduling_priority=current.scheduling_priority,
            notes=current.notes,
            room_locations=current.room_locations,
            active=False,
        )
        return self.update(code, data, expected_version=expected_version)
