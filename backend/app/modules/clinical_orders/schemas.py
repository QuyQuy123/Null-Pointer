from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.modules.clinical_orders.entities import (
    ClinicalServiceDefinition,
    ClinicalServiceGroup,
    ClinicalServiceInput,
    FastingPolicy,
    RoomServiceType,
    SchedulingPriority,
)


class ClinicalServicePayload(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    service_group: ClinicalServiceGroup
    room_service_type: RoomServiceType
    description: str | None = Field(default=None, max_length=500)
    execution_minutes_min: int = Field(ge=1, le=480)
    execution_minutes_max: int = Field(ge=1, le=480)
    turnaround_minutes_min: int = Field(ge=0, le=2880)
    turnaround_minutes_max: int = Field(ge=0, le=2880)
    fasting_policy: FastingPolicy
    fasting_hours_min: int | None = Field(default=None, ge=0, le=24)
    fasting_hours_max: int | None = Field(default=None, ge=0, le=24)
    scheduling_priority: SchedulingPriority
    notes: str | None = Field(default=None, max_length=1000)
    room_locations: list[str] = Field(min_length=1, max_length=30)
    active: bool = True

    @field_validator("name", "description", "notes", mode="before")
    @classmethod
    def strip_optional_text(cls, value: object) -> object:
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        return value

    @field_validator("room_locations")
    @classmethod
    def validate_room_locations(cls, value: list[str]) -> list[str]:
        normalized = [room.strip().upper() for room in value if room.strip()]
        if not normalized:
            raise ValueError("Phải có ít nhất một phòng hoặc tòa.")
        if len(normalized) != len(set(normalized)):
            raise ValueError("Danh sách phòng hoặc tòa không được trùng nhau.")
        return normalized

    @model_validator(mode="after")
    def validate_ranges(self) -> "ClinicalServicePayload":
        if self.execution_minutes_max < self.execution_minutes_min:
            raise ValueError("Thời gian thực hiện tối đa phải lớn hơn hoặc bằng tối thiểu.")
        if self.turnaround_minutes_max < self.turnaround_minutes_min:
            raise ValueError("TAT tối đa phải lớn hơn hoặc bằng TAT tối thiểu.")

        fasting_values = (self.fasting_hours_min, self.fasting_hours_max)
        if self.fasting_policy == FastingPolicy.REQUIRED and None in fasting_values:
            raise ValueError("Dịch vụ yêu cầu nhịn ăn phải có số giờ tối thiểu và tối đa.")
        if self.fasting_policy == FastingPolicy.NOT_REQUIRED and any(
            value is not None for value in fasting_values
        ):
            raise ValueError("Dịch vụ không yêu cầu nhịn ăn thì không nhập số giờ nhịn ăn.")
        if (
            self.fasting_hours_min is not None
            and self.fasting_hours_max is not None
            and self.fasting_hours_max < self.fasting_hours_min
        ):
            raise ValueError("Số giờ nhịn ăn tối đa phải lớn hơn hoặc bằng tối thiểu.")
        return self

    def to_input(self, code: str) -> ClinicalServiceInput:
        return ClinicalServiceInput(
            code=code,
            name=self.name,
            service_group=self.service_group,
            room_service_type=self.room_service_type,
            description=self.description,
            execution_minutes_min=self.execution_minutes_min,
            execution_minutes_max=self.execution_minutes_max,
            turnaround_minutes_min=self.turnaround_minutes_min,
            turnaround_minutes_max=self.turnaround_minutes_max,
            fasting_policy=self.fasting_policy,
            fasting_hours_min=self.fasting_hours_min,
            fasting_hours_max=self.fasting_hours_max,
            scheduling_priority=self.scheduling_priority,
            notes=self.notes,
            room_locations=tuple(self.room_locations),
            active=self.active,
        )


class CreateClinicalServiceRequest(ClinicalServicePayload):
    code: str = Field(pattern=r"^[A-Z0-9][A-Z0-9_-]{2,39}$")

    @field_validator("code", mode="before")
    @classmethod
    def normalize_code(cls, value: object) -> object:
        return value.strip().upper() if isinstance(value, str) else value


class UpdateClinicalServiceRequest(ClinicalServicePayload):
    expected_version: int = Field(ge=1)


class ClinicalServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
    room_locations: list[str]
    active: bool
    version: int
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(
        cls,
        entity: ClinicalServiceDefinition,
    ) -> "ClinicalServiceResponse":
        return cls.model_validate(entity)


class ClinicalServiceFeedResponse(BaseModel):
    contract_version: str = "clinical-service-feed.v1"
    source_system: str = "hospital-simulator"
    is_simulation: bool = True
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    total: int = Field(ge=0)
    services: list[ClinicalServiceResponse]
