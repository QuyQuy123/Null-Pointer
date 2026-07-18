from fastapi import APIRouter

from app.api.health import router as health_router
from app.core.config import get_settings
from app.modules.reservations.router import router as reservations_router
from app.modules.routing.router import router as routing_router
from app.modules.simulation.clinical_order_router import (
    router as clinical_order_simulation_router,
)
from app.modules.simulation.clinical_service_router import (
    router as clinical_service_simulation_router,
)
from app.modules.simulation.router import router as simulation_router
from app.modules.support.router import router as support_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(routing_router, prefix="/api/v1")
api_router.include_router(reservations_router, prefix="/api/v1")
if get_settings().demo_simulation_enabled:
    api_router.include_router(simulation_router, prefix="/api/v1")
    api_router.include_router(clinical_service_simulation_router, prefix="/api/v1")
    api_router.include_router(clinical_order_simulation_router, prefix="/api/v1")
api_router.include_router(support_router, prefix="/api/v1")
