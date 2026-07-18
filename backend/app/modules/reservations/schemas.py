from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class ReservationStatus(StrEnum):
    HELD = "held"
    CONFIRMED = "confirmed"
    EXPIRED = "expired"
    RELEASED = "released"


class CreateRouteReservationRequest(BaseModel):
    encounter_id: str = Field(min_length=1, max_length=100)
    route_proposal_id: str = Field(min_length=1, max_length=100)
    route_option_id: str = Field(min_length=1, max_length=100)
    idempotency_key: str = Field(min_length=8, max_length=200)


class RouteReservationResponse(BaseModel):
    id: str
    encounter_id: str
    route_proposal_id: str
    route_option_id: str
    status: ReservationStatus
    is_demo: bool
    created_at: datetime
    expires_at: datetime
    confirmed_at: datetime | None = None
    journey_id: str | None = None
    extension_count: int = Field(ge=0)
