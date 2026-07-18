from collections import defaultdict
from datetime import UTC, datetime
from uuid import uuid4

from app.modules.clinical_orders.entities import (
    ClinicalServiceDefinition,
    RoomServiceType,
    SchedulingPriority,
)
from app.modules.clinical_orders.service import ClinicalServiceCatalogService
from app.modules.routing.catalog import (
    SERVICE_CATALOG,
    LockedPosition,
    ServiceDefinition,
)
from app.modules.routing.exceptions import NoFeasibleRouteError
from app.modules.routing.schemas import CreateRouteProposalRequest, ServiceCode
from app.modules.routing.service import RouteProposalService
from app.modules.simulation.clinical_order_repository import (
    SqliteClinicalOrderRepository,
)
from app.modules.simulation.clinical_order_schemas import (
    ClinicalOrderDispatchResponse,
    ClinicalOrderStatus,
    DispatchClinicalOrderRequest,
    DispatchedClinicalOrderItemResponse,
    MatchedRoomResponse,
)
from app.modules.simulation.service import HospitalSimulationService


class ClinicalOrderNotFoundError(LookupError):
    pass


ROOM_TYPE_TO_ROUTE_CODE = {
    RoomServiceType.BLOOD_TEST: ServiceCode.BLOOD_TEST,
    RoomServiceType.URINE_TEST: ServiceCode.URINE_TEST,
    RoomServiceType.XRAY: ServiceCode.CHEST_XRAY,
    RoomServiceType.ULTRASOUND: ServiceCode.ABDOMINAL_ULTRASOUND,
    RoomServiceType.CT_SCAN: ServiceCode.CT_SCAN,
}

SCHEDULING_WEIGHT = {
    SchedulingPriority.FLOW_START: 0,
    SchedulingPriority.MORNING: 1,
    SchedulingPriority.LONG_TURNAROUND: 2,
    SchedulingPriority.FLEXIBLE: 3,
}


class ClinicalOrderSimulationService:
    """Nhận chỉ định giả lập, đối chiếu phòng và gọi bộ tối ưu lộ trình hiện có."""

    def __init__(
        self,
        catalog: ClinicalServiceCatalogService,
        simulation: HospitalSimulationService,
        routing: RouteProposalService,
        repository: SqliteClinicalOrderRepository,
    ) -> None:
        self._catalog = catalog
        self._simulation = simulation
        self._routing = routing
        self._repository = repository

    def dispatch(
        self,
        request: DispatchClinicalOrderRequest,
    ) -> ClinicalOrderDispatchResponse:
        selected_services = [
            self._catalog.get_service(code)
            for code in request.clinical_service_codes
        ]
        inactive = [service.code for service in selected_services if not service.active]
        if inactive:
            raise NoFeasibleRouteError(
                "Các dịch vụ đã ngừng sử dụng: " + ", ".join(inactive)
            )

        grouped = self._group_services(selected_services)
        snapshot = self._simulation.get_snapshot()
        dynamic_catalog = dict(SERVICE_CATALOG)
        allowed_room_locations: dict[ServiceCode, frozenset[str]] = {}
        required_service_codes: list[ServiceCode] = []
        item_responses: list[DispatchedClinicalOrderItemResponse] = []

        for room_type, services in grouped:
            route_code = ROOM_TYPE_TO_ROUTE_CODE[room_type]
            common_locations = self._common_locations(services)
            matched_rooms = [
                room
                for room in snapshot.rooms
                if room.service_type == room_type.value
                and room.location_code in common_locations
                and room.status.value != "paused"
                and room.equipment_status.value == "operational"
            ]
            if not matched_rooms:
                raise NoFeasibleRouteError(
                    "Không có phòng đang hoạt động vừa đúng loại vừa thuộc danh sách "
                    f"đã cấu hình cho: {', '.join(service.name for service in services)}."
                )

            dynamic_catalog[route_code] = self._build_route_definition(
                route_code,
                room_type,
                services,
            )
            allowed_room_locations[route_code] = frozenset(common_locations)
            required_service_codes.append(route_code)
            room_responses = [
                MatchedRoomResponse(
                    code=room.code,
                    location_code=room.location_code,
                    name=room.name,
                    floor=room.floor,
                    status=room.status.value,
                    waiting_patients=room.waiting_patients,
                    estimated_wait_minutes=room.estimated_wait_minutes,
                )
                for room in matched_rooms
            ]
            item_responses.extend(
                self._to_item_response(service, room_responses)
                for service in services
            )

        required_service_codes.append(ServiceCode.DOCTOR_RETURN)
        route_request = CreateRouteProposalRequest(
            priority=request.priority,
            schedule_strategy=request.schedule_strategy,
            required_service_codes=required_service_codes,
            start_room_code=request.doctor_room_code,
        )
        proposal = self._routing.create_proposal(
            request.encounter_id,
            route_request,
            service_catalog=dynamic_catalog,
            allowed_room_locations=allowed_room_locations,
        )
        order = ClinicalOrderDispatchResponse(
            id=f"SIM-ORDER-{uuid4().hex[:12].upper()}",
            status=ClinicalOrderStatus.ROUTED,
            patient_code=request.patient_code,
            patient_name=request.patient_name,
            encounter_id=request.encounter_id,
            doctor_name=request.doctor_name,
            doctor_room_code=request.doctor_room_code,
            created_at=datetime.now(UTC),
            items=item_responses,
            route_proposal=proposal,
        )
        self._repository.save(order)
        return order

    def get_latest_for_patient(self, patient_code: str) -> ClinicalOrderDispatchResponse:
        order = self._repository.get_latest(patient_code.strip())
        if order is None:
            raise ClinicalOrderNotFoundError(patient_code)
        return order

    def _group_services(
        self,
        services: list[ClinicalServiceDefinition],
    ) -> list[tuple[RoomServiceType, list[ClinicalServiceDefinition]]]:
        grouped: dict[RoomServiceType, list[ClinicalServiceDefinition]] = defaultdict(list)
        for service in services:
            if service.room_service_type not in ROOM_TYPE_TO_ROUTE_CODE:
                raise NoFeasibleRouteError(
                    f"Chưa hỗ trợ điều phối loại phòng {service.room_service_type}."
                )
            grouped[service.room_service_type].append(service)
        return sorted(
            grouped.items(),
            key=lambda item: min(
                SCHEDULING_WEIGHT[service.scheduling_priority]
                for service in item[1]
            ),
        )

    def _common_locations(
        self,
        services: list[ClinicalServiceDefinition],
    ) -> set[str]:
        common = set(services[0].room_locations)
        for service in services[1:]:
            common.intersection_update(service.room_locations)
        if not common:
            raise NoFeasibleRouteError(
                "Không có phòng chung có thể thực hiện đồng thời các chỉ định: "
                + ", ".join(service.name for service in services)
            )
        return common

    def _build_route_definition(
        self,
        route_code: ServiceCode,
        room_type: RoomServiceType,
        services: list[ClinicalServiceDefinition],
    ) -> ServiceDefinition:
        must_start_early = any(
            service.scheduling_priority
            in (SchedulingPriority.FLOW_START, SchedulingPriority.MORNING)
            for service in services
        )
        service_name = (
            services[0].name
            if len(services) == 1
            else f"Thực hiện {len(services)} chỉ định cùng loại"
        )
        return ServiceDefinition(
            code=route_code,
            name=service_name,
            room_service_type=room_type.value,
            result_turnaround_minutes=max(
                service.turnaround_minutes_max for service in services
            ),
            locked_position=LockedPosition.FIRST if must_start_early else None,
            lock_reason=(
                "Ưu tiên sớm theo cấu hình của chỉ định bác sĩ."
                if must_start_early
                else None
            ),
        )

    def _to_item_response(
        self,
        service: ClinicalServiceDefinition,
        matched_rooms: list[MatchedRoomResponse],
    ) -> DispatchedClinicalOrderItemResponse:
        return DispatchedClinicalOrderItemResponse(
            service_code=service.code,
            service_name=service.name,
            room_service_type=service.room_service_type,
            fasting_policy=service.fasting_policy,
            fasting_hours_min=service.fasting_hours_min,
            fasting_hours_max=service.fasting_hours_max,
            notes=service.notes,
            configured_room_locations=list(service.room_locations),
            matched_rooms=matched_rooms,
        )
