from fastapi import APIRouter, HTTPException, status

from app.modules.clinical_orders.exceptions import ClinicalServiceNotFoundError
from app.modules.routing.exceptions import NoFeasibleRouteError
from app.modules.simulation.clinical_order_runtime import (
    clinical_order_simulation_service as service,
)
from app.modules.simulation.clinical_order_schemas import (
    ClinicalOrderDispatchResponse,
    DispatchClinicalOrderRequest,
)
from app.modules.simulation.clinical_order_service import ClinicalOrderNotFoundError

router = APIRouter(prefix="/simulation", tags=["demo-clinical-order-dispatch"])


@router.post(
    "/clinical-orders",
    response_model=ClinicalOrderDispatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Gửi chỉ định giả lập và tạo lộ trình cho bệnh nhân",
)
def dispatch_clinical_order(
    request: DispatchClinicalOrderRequest,
) -> ClinicalOrderDispatchResponse:
    try:
        return service.dispatch(request)
    except ClinicalServiceNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy dịch vụ {error.args[0]} trong danh mục.",
        ) from error
    except NoFeasibleRouteError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.get(
    "/patients/{patient_code}/clinical-orders/latest",
    response_model=ClinicalOrderDispatchResponse,
    summary="Lấy chỉ định mới nhất bệnh nhân đã nhận",
)
def get_latest_patient_order(patient_code: str) -> ClinicalOrderDispatchResponse:
    try:
        return service.get_latest_for_patient(patient_code)
    except ClinicalOrderNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bệnh nhân chưa nhận chỉ định giả lập nào.",
        ) from error
