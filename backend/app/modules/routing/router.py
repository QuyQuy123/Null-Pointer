from fastapi import APIRouter, HTTPException, status

from app.modules.routing.exceptions import NoFeasibleRouteError
from app.modules.routing.runtime import route_proposal_service
from app.modules.routing.schemas import (
    CreateRouteProposalRequest,
    RouteProposalResponse,
)

router = APIRouter(prefix="/encounters", tags=["routing"])
service = route_proposal_service


@router.post(
    "/{encounter_id}/route-proposals",
    response_model=RouteProposalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo các phương án lộ trình",
)
async def create_route_proposal(
    encounter_id: str,
    request: CreateRouteProposalRequest,
) -> RouteProposalResponse:
    try:
        return service.create_proposal(encounter_id, request)
    except NoFeasibleRouteError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error
