from fastapi import APIRouter, HTTPException, status

from app.modules.reservations.exceptions import (
    ReservationExpiredError,
    ReservationNotFoundError,
    ReservationStateError,
)
from app.modules.reservations.runtime import reservation_service
from app.modules.reservations.schemas import (
    CreateRouteReservationRequest,
    RouteReservationResponse,
    UpdateJourneyProgressRequest,
)
from app.modules.routing.exceptions import (
    RouteOptionNotFoundError,
    RouteProposalExpiredError,
    RouteProposalNotFoundError,
)

router = APIRouter(prefix="/route-reservations", tags=["reservations"])


@router.post(
    "",
    response_model=RouteReservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Giữ tạm một phương án lộ trình",
)
async def create_route_reservation(
    request: CreateRouteReservationRequest,
) -> RouteReservationResponse:
    try:
        return reservation_service.create_hold(request)
    except (RouteProposalNotFoundError, RouteOptionNotFoundError) as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except RouteProposalExpiredError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error


@router.post(
    "/{reservation_id}/confirm",
    response_model=RouteReservationResponse,
    summary="Xác nhận chỗ và tạo hành trình",
)
async def confirm_route_reservation(reservation_id: str) -> RouteReservationResponse:
    try:
        return reservation_service.confirm(reservation_id)
    except ReservationNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except (ReservationExpiredError, ReservationStateError) as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error


@router.post(
    "/{reservation_id}/extend",
    response_model=RouteReservationResponse,
    summary="Gia hạn lượt giữ chỗ",
)
async def extend_route_reservation(reservation_id: str) -> RouteReservationResponse:
    try:
        return reservation_service.extend(reservation_id)
    except ReservationNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except (ReservationExpiredError, ReservationStateError) as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error


@router.get(
    "/patients/{patient_code}/latest",
    response_model=RouteReservationResponse,
    summary="Lấy hành trình mới nhất đã lưu của bệnh nhân",
)
async def get_latest_patient_reservation(patient_code: str) -> RouteReservationResponse:
    try:
        return reservation_service.get_latest_for_patient(patient_code)
    except ReservationNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error


@router.patch(
    "/{reservation_id}/progress",
    response_model=RouteReservationResponse,
    summary="Lưu bước hành trình hiện tại của bệnh nhân",
)
async def update_journey_progress(
    reservation_id: str,
    request: UpdateJourneyProgressRequest,
) -> RouteReservationResponse:
    try:
        return reservation_service.update_progress(
            reservation_id,
            current_step=request.current_step,
            journey_status=request.journey_status,
        )
    except ReservationNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except ReservationStateError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
