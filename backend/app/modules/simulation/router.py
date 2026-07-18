from fastapi import APIRouter, HTTPException, status

from app.modules.simulation.fixtures import RoomSeed
from app.modules.simulation.room_repository import SimulationRoomConflictError
from app.modules.simulation.runtime import simulation_service as service
from app.modules.simulation.schemas import (
    AdjustRoomQueueRequest,
    AdvanceSimulationRequest,
    CreateSimulationRoomRequest,
    SimulationSnapshot,
    UpdateRoomOperationRequest,
)

router = APIRouter(prefix="/simulation", tags=["demo-simulation"])


@router.get(
    "/snapshot",
    response_model=SimulationSnapshot,
    summary="Lấy trạng thái dữ liệu mô phỏng",
)
def get_simulation_snapshot() -> SimulationSnapshot:
    return service.get_snapshot()


@router.post(
    "/advance",
    response_model=SimulationSnapshot,
    summary="Tiến đồng hồ mô phỏng",
)
def advance_simulation(request: AdvanceSimulationRequest) -> SimulationSnapshot:
    return service.advance(request.minutes)


@router.post(
    "/reset",
    response_model=SimulationSnapshot,
    summary="Đặt lại kịch bản mô phỏng",
)
def reset_simulation() -> SimulationSnapshot:
    return service.reset()


@router.patch(
    "/rooms/{room_code}",
    response_model=SimulationSnapshot,
    summary="Tạm dừng hoặc mở lại phòng mô phỏng",
)
def update_room_operation(
    room_code: str,
    request: UpdateRoomOperationRequest,
) -> SimulationSnapshot:
    try:
        return service.set_room_operation(
            room_code,
            operational=request.operational,
            reason=request.reason,
        )
    except KeyError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phòng mô phỏng.",
        ) from error


@router.post(
    "/rooms",
    response_model=SimulationSnapshot,
    status_code=status.HTTP_201_CREATED,
    summary="Thêm phòng vào hệ thống giả lập",
)
def create_simulation_room(
    request: CreateSimulationRoomRequest,
) -> SimulationSnapshot:
    try:
        return service.create_room(
            RoomSeed(
                code=request.code,
                location_code=request.location_code,
                name=request.name,
                department=request.department,
                floor=request.floor,
                service_type=request.service_type,
                average_service_minutes=request.average_service_minutes,
                initially_operational=request.operational,
            ),
            operational=request.operational,
            initial_waiting_patients=request.initial_waiting_patients,
        )
    except SimulationRoomConflictError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.patch(
    "/rooms/{room_code}/queue",
    response_model=SimulationSnapshot,
    summary="Tăng hoặc giảm số bệnh nhân đang chờ tại phòng",
)
def adjust_room_queue(
    room_code: str,
    request: AdjustRoomQueueRequest,
) -> SimulationSnapshot:
    try:
        return service.adjust_room_queue(room_code, request.delta)
    except KeyError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phòng mô phỏng.",
        ) from error
