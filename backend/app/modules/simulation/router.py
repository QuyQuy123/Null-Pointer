from fastapi import APIRouter, HTTPException, status

from app.modules.simulation.runtime import simulation_service as service
from app.modules.simulation.schemas import (
    AdvanceSimulationRequest,
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
