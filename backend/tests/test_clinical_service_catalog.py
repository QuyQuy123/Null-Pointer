from dataclasses import replace
from pathlib import Path

import pytest

from app.modules.clinical_orders.entities import (
    ClinicalServiceGroup,
    ClinicalServiceInput,
    FastingPolicy,
    RoomServiceType,
    SchedulingPriority,
)
from app.modules.clinical_orders.exceptions import ClinicalServiceConflictError
from app.modules.clinical_orders.service import ClinicalServiceCatalogService
from app.modules.simulation.clinical_service_repository import (
    SqliteClinicalServiceRepository,
)


def make_service_input(code: str = "LAB-TEST") -> ClinicalServiceInput:
    return ClinicalServiceInput(
        code=code,
        name="Xét nghiệm kiểm thử",
        service_group=ClinicalServiceGroup.LABORATORY,
        room_service_type=RoomServiceType.BLOOD_TEST,
        description="Dữ liệu chỉ dùng trong kiểm thử",
        execution_minutes_min=3,
        execution_minutes_max=5,
        turnaround_minutes_min=30,
        turnaround_minutes_max=45,
        fasting_policy=FastingPolicy.NOT_REQUIRED,
        fasting_hours_min=None,
        fasting_hours_max=None,
        scheduling_priority=SchedulingPriority.FLEXIBLE,
        notes=None,
        room_locations=("101 K1",),
    )


def make_catalog(database_path: Path) -> ClinicalServiceCatalogService:
    return ClinicalServiceCatalogService(
        SqliteClinicalServiceRepository(database_path)
    )


def test_catalog_persists_data_across_repository_instances(tmp_path: Path) -> None:
    database_path = tmp_path / "simulation.db"
    catalog = make_catalog(database_path)

    created = catalog.create(make_service_input())
    reloaded_catalog = make_catalog(database_path)
    reloaded = reloaded_catalog.get_service(created.code)

    assert reloaded.name == "Xét nghiệm kiểm thử"
    assert reloaded.room_locations == ("101 K1",)
    assert reloaded.version == 1


def test_catalog_uses_version_to_prevent_overwriting_newer_data(
    tmp_path: Path,
) -> None:
    catalog = make_catalog(tmp_path / "simulation.db")
    created = catalog.create(make_service_input())
    changed_input = replace(make_service_input(), name="Xét nghiệm đã cập nhật")

    updated = catalog.update(
        created.code,
        changed_input,
        expected_version=created.version,
    )

    assert updated.version == 2
    with pytest.raises(ClinicalServiceConflictError):
        catalog.update(
            created.code,
            changed_input,
            expected_version=created.version,
        )


def test_deactivate_keeps_record_but_removes_it_from_active_feed(
    tmp_path: Path,
) -> None:
    catalog = make_catalog(tmp_path / "simulation.db")
    created = catalog.create(make_service_input())

    stopped = catalog.deactivate(created.code, expected_version=created.version)

    assert stopped.active is False
    assert catalog.list_services() == []
    assert catalog.list_services(include_inactive=True)[0].code == created.code
