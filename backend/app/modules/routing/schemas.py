from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field, field_validator

from app.shared.enums import RoutePriority


class RouteLabel(StrEnum):
    RECOMMENDED = "recommended"
    LESS_WALK = "less_walk"
    LESS_CROWD = "less_crowd"


class ScheduleStrategy(StrEnum):
    BALANCED = "balanced"
    FINISH_EARLY = "finish_early"
    LEAVE_FAST = "leave_fast"


class ServiceCode(StrEnum):
    BLOOD_TEST = "blood_test"
    URINE_TEST = "urine_test"
    CHEST_XRAY = "chest_xray"
    ABDOMINAL_ULTRASOUND = "abdominal_ultrasound"
    CT_SCAN = "ct_scan"
    DOCTOR_RETURN = "doctor_return"


class AccessibilityNeeds(BaseModel):
    wheelchair: bool = False
    avoid_stairs: bool = False
    visual_assistance: bool = False


class CreateRouteProposalRequest(BaseModel):
    priority: RoutePriority = RoutePriority.FASTEST
    schedule_strategy: ScheduleStrategy = ScheduleStrategy.BALANCED
    accessibility: AccessibilityNeeds = Field(default_factory=AccessibilityNeeds)
    required_service_codes: list[ServiceCode] = Field(
        default_factory=lambda: [
            ServiceCode.BLOOD_TEST,
            ServiceCode.CHEST_XRAY,
            ServiceCode.ABDOMINAL_ULTRASOUND,
            ServiceCode.DOCTOR_RETURN,
        ],
        min_length=1,
        max_length=8,
    )
    start_room_code: str | None = "PK-305"

    @field_validator("required_service_codes")
    @classmethod
    def validate_unique_services(cls, value: list[ServiceCode]) -> list[ServiceCode]:
        if len(value) != len(set(value)):
            raise ValueError("Mỗi dịch vụ chỉ được xuất hiện một lần trong chỉ định")
        return value


class RouteStepResponse(BaseModel):
    id: str
    order: int = Field(ge=1)
    service_code: str
    service_name: str
    room_code: str
    room_name: str
    floor: str
    wait_minutes_min: int = Field(ge=0)
    wait_minutes_max: int = Field(ge=0)
    service_minutes: int = Field(gt=0)
    travel_minutes: int = Field(ge=0)
    arrival_minutes: int = Field(ge=0)
    complete_minutes: int = Field(ge=0)
    result_ready_minutes: int = Field(ge=0)
    is_locked: bool = False
    lock_reason: str | None = None


class RouteOptionResponse(BaseModel):
    id: str
    label: RouteLabel
    duration_minutes_min: int = Field(ge=0)
    duration_minutes_max: int = Field(ge=0)
    distance_meters: int = Field(ge=0)
    floor_changes: int = Field(ge=0)
    total_wait_minutes: int = Field(ge=0)
    tests_completed_minutes: int = Field(ge=0)
    results_ready_minutes: int = Field(ge=0)
    doctor_return_minutes: int | None = Field(default=None, ge=0)
    ranking_score: float = Field(ge=0)
    is_accessible: bool
    reason: str
    steps: list[RouteStepResponse]


class RouteProposalResponse(BaseModel):
    id: str
    encounter_id: str
    priority: RoutePriority
    schedule_strategy: ScheduleStrategy
    required_service_codes: list[ServiceCode]
    is_demo: bool
    algorithm_version: str
    simulation_tick: int = Field(ge=0)
    updated_at: datetime
    expires_at: datetime
    warnings: list[str]
    options: list[RouteOptionResponse]
