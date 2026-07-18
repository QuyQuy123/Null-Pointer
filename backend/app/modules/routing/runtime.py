from app.core.config import get_settings
from app.modules.routing.repository import SqliteRouteProposalRepository
from app.modules.routing.service import RouteProposalService
from app.modules.simulation.clinical_service_repository import sqlite_path_from_url

route_proposal_repository = SqliteRouteProposalRepository(
    sqlite_path_from_url(get_settings().database_url)
)
route_proposal_service = RouteProposalService(repository=route_proposal_repository)
