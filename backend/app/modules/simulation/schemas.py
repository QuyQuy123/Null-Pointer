from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field

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


class RoomSnapshot(BaseModel):
    code: str
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
