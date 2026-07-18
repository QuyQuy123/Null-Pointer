from app.core.config import get_settings
from app.modules.reservations.repository import SqliteRouteReservationRepository
from app.modules.reservations.service import RouteReservationService
from app.modules.simulation.clinical_service_repository import sqlite_path_from_url

reservation_repository = SqliteRouteReservationRepository(
    sqlite_path_from_url(get_settings().database_url)
)
reservation_service = RouteReservationService(repository=reservation_repository)
