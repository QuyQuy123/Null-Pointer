from fastapi import APIRouter, HTTPException, Query, status

from app.modules.clinical_orders.exceptions import (
    ClinicalServiceConflictError,
    ClinicalServiceNotFoundError,
)
from app.modules.clinical_orders.schemas import (
    ClinicalServiceFeedResponse,
    ClinicalServiceResponse,
    CreateClinicalServiceRequest,
    UpdateClinicalServiceRequest,
)
from app.modules.simulation.clinical_service_runtime import (
    clinical_service_catalog_service as service,
)

router = APIRouter(
    prefix="/simulation/clinical-services",
    tags=["demo-hospital-data"],
)


def _to_response(item: object) -> ClinicalServiceResponse:
    return ClinicalServiceResponse.model_validate(item)


def _feed(*, include_inactive: bool) -> ClinicalServiceFeedResponse:
    services = service.list_services(include_inactive=include_inactive)
    responses = [_to_response(item) for item in services]
    return ClinicalServiceFeedResponse(total=len(responses), services=responses)


@router.get(
    "",
    response_model=ClinicalServiceFeedResponse,
    summary="Lấy danh mục cận lâm sàng đã lưu trong bộ giả lập",
)
def list_clinical_services(
    include_inactive: bool = Query(default=True),
) -> ClinicalServiceFeedResponse:
    return _feed(include_inactive=include_inactive)


@router.get(
    "/hospital-feed",
    response_model=ClinicalServiceFeedResponse,
    summary="Xem dữ liệu theo hợp đồng mà hệ thống bệnh viện sẽ cung cấp",
)
def get_hospital_feed() -> ClinicalServiceFeedResponse:
    return _feed(include_inactive=False)


@router.post(
    "",
    response_model=ClinicalServiceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo dịch vụ cận lâm sàng giả lập",
)
def create_clinical_service(
    request: CreateClinicalServiceRequest,
) -> ClinicalServiceResponse:
    try:
        item = service.create(request.to_input(request.code))
        return _to_response(item)
    except ClinicalServiceConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error


@router.put(
    "/{service_code}",
    response_model=ClinicalServiceResponse,
    summary="Cập nhật dịch vụ cận lâm sàng giả lập",
)
def update_clinical_service(
    service_code: str,
    request: UpdateClinicalServiceRequest,
) -> ClinicalServiceResponse:
    try:
        item = service.update(
            service_code,
            request.to_input(service_code),
            expected_version=request.expected_version,
        )
        return _to_response(item)
    except ClinicalServiceNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy dịch vụ cận lâm sàng.",
        ) from error
    except ClinicalServiceConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error


@router.delete(
    "/{service_code}",
    response_model=ClinicalServiceResponse,
    summary="Ngừng sử dụng dịch vụ nhưng vẫn giữ lịch sử",
)
def deactivate_clinical_service(
    service_code: str,
    expected_version: int = Query(ge=1),
) -> ClinicalServiceResponse:
    try:
        item = service.deactivate(
            service_code,
            expected_version=expected_version,
        )
        return _to_response(item)
    except ClinicalServiceNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy dịch vụ cận lâm sàng.",
        ) from error
    except ClinicalServiceConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
