from app.core.config import get_settings
from app.modules.clinical_orders.service import ClinicalServiceCatalogService
from app.modules.simulation.clinical_service_fixtures import CLINICAL_SERVICE_SEEDS
from app.modules.simulation.clinical_service_repository import (
    SqliteClinicalServiceRepository,
    sqlite_path_from_url,
)

clinical_service_repository = SqliteClinicalServiceRepository(
    sqlite_path_from_url(get_settings().database_url)
)
clinical_service_catalog_service = ClinicalServiceCatalogService(
    clinical_service_repository
)
clinical_service_catalog_service.seed_if_empty(CLINICAL_SERVICE_SEEDS)
