from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field, field_validator

from app.shared.enums import JourneyStepStatus


class RoomStatus(StrEnum):
    AVAILABLE = "available"
    SERVING = "serving"
    OVERLOADED = "overloaded"
    PAUSED = "paused"


class EquipmentStatus(StrEnum):
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"


class DemoPriority(StrEnum):
    NORMAL = "normal"
    PRIORITY = "priority"


class SimulationEventType(StrEnum):
    RESET = "reset"
    PATIENT_ARRIVED = "patient_arrived"
    SERVICE_STARTED = "service_started"
    SERVICE_COMPLETED = "service_completed"
    JOURNEY_COMPLETED = "journey_completed"
    ROOM_PAUSED = "room_paused"
    ROOM_REOPENED = "room_reopened"
    ROOM_CREATED = "room_created"
    QUEUE_ADJUSTED = "queue_adjusted"


class RoomSnapshot(BaseModel):
    code: str
    location_code: str
    name: str
    department: str
    floor: str
    service_type: str
    status: RoomStatus
    equipment_status: EquipmentStatus
    waiting_patients: int = Field(ge=0)
    waiting_patient_codes: list[str]
    current_patient_code: str | None
    average_service_minutes: int = Field(gt=0)
    estimated_wait_minutes: int = Field(ge=0)
    status_reason: str | None
    updated_at: datetime


class PatientSnapshot(BaseModel):
    code: str
    priority: DemoPriority
    status: JourneyStepStatus
    current_room_code: str | None
    current_step: int = Field(ge=0)
    total_steps: int = Field(gt=0)
    route_room_codes: list[str]
    queued_at: datetime | None


class SimulationEventResponse(BaseModel):
    id: str
    type: SimulationEventType
    message: str
    occurred_at: datetime
    room_code: str | None = None
    patient_code: str | None = None


class SimulationSummary(BaseModel):
    total_rooms: int = Field(ge=0)
    available_rooms: int = Field(ge=0)
    serving_rooms: int = Field(ge=0)
    overloaded_rooms: int = Field(ge=0)
    paused_rooms: int = Field(ge=0)
    waiting_patients: int = Field(ge=0)
    in_service_patients: int = Field(ge=0)
    completed_patients: int = Field(ge=0)
    average_wait_minutes: int = Field(ge=0)
    longest_wait_minutes: int = Field(ge=0)


class SimulationSnapshot(BaseModel):
    scenario_id: str
    is_demo: bool = True
    data_notice: str
    tick: int = Field(ge=0)
    simulation_time: datetime
    updated_at: datetime
    summary: SimulationSummary
    rooms: list[RoomSnapshot]
    patients: list[PatientSnapshot]
    recent_events: list[SimulationEventResponse]


class AdvanceSimulationRequest(BaseModel):
    minutes: int = Field(default=5, ge=1, le=30)


class UpdateRoomOperationRequest(BaseModel):
    operational: bool
    reason: str | None = Field(default=None, max_length=200)


class CreateSimulationRoomRequest(BaseModel):
    code: str = Field(min_length=2, max_length=30)
    location_code: str = Field(min_length=2, max_length=40)
    name: str = Field(min_length=2, max_length=120)
    department: str = Field(min_length=2, max_length=120)
    floor: str = Field(min_length=1, max_length=40)
    service_type: str = Field(
        pattern="^(blood_test|urine_test|xray|ultrasound|ct_scan|consultation)$"
    )
    average_service_minutes: int = Field(ge=1, le=180)
    initial_waiting_patients: int = Field(default=0, ge=0, le=200)
    operational: bool = True

    @field_validator("code", "location_code", mode="before")
    @classmethod
    def normalize_codes(cls, value: object) -> object:
        return value.strip().upper() if isinstance(value, str) else value

    @field_validator("name", "department", "floor", mode="before")
    @classmethod
    def strip_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class AdjustRoomQueueRequest(BaseModel):
    delta: int = Field(ge=-50, le=50)

    @field_validator("delta")
    @classmethod
    def delta_must_not_be_zero(cls, value: int) -> int:
        if value == 0:
            raise ValueError("Mức thay đổi hàng chờ phải khác 0.")
        return value
