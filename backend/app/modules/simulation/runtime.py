from app.core.config import get_settings
from app.modules.simulation.clinical_service_repository import sqlite_path_from_url
from app.modules.simulation.room_repository import SqliteSimulationRoomRepository
from app.modules.simulation.service import HospitalSimulationService

simulation_room_repository = SqliteSimulationRoomRepository(
    sqlite_path_from_url(get_settings().database_url)
)
simulation_service = HospitalSimulationService(room_repository=simulation_room_repository)
