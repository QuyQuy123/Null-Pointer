from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum


class ClinicalServiceGroup(StrEnum):
    LABORATORY = "laboratory"
    IMAGING = "imaging"
    FUNCTIONAL_DIAGNOSTICS = "functional_diagnostics"
    OTHER = "other"


class FastingPolicy(StrEnum):
    NOT_REQUIRED = "not_required"
    REQUIRED = "required"
    CONDITIONAL = "conditional"


class SchedulingPriority(StrEnum):
    FLOW_START = "flow_start"
    MORNING = "morning"
    LONG_TURNAROUND = "long_turnaround"
    FLEXIBLE = "flexible"


class RoomServiceType(StrEnum):
    BLOOD_TEST = "blood_test"
    URINE_TEST = "urine_test"
    XRAY = "xray"
    ULTRASOUND = "ultrasound"
    CT_SCAN = "ct_scan"


@dataclass(frozen=True, slots=True)
class ClinicalServiceInput:
    code: str
    name: str
    service_group: ClinicalServiceGroup
    room_service_type: RoomServiceType
    description: str | None
    execution_minutes_min: int
    execution_minutes_max: int
    turnaround_minutes_min: int
    turnaround_minutes_max: int
    fasting_policy: FastingPolicy
    fasting_hours_min: int | None
    fasting_hours_max: int | None
    scheduling_priority: SchedulingPriority
    notes: str | None
    room_locations: tuple[str, ...]
    active: bool = True


@dataclass(frozen=True, slots=True)
class ClinicalServiceDefinition(ClinicalServiceInput):
    version: int = 1
    created_at: datetime | None = None
    updated_at: datetime | None = None
