from dataclasses import dataclass
from enum import StrEnum

from app.modules.routing.schemas import ServiceCode


class LockedPosition(StrEnum):
    FIRST = "first"
    LAST = "last"


@dataclass(frozen=True, slots=True)
class ServiceDefinition:
    code: ServiceCode
    name: str
    room_service_type: str
    result_turnaround_minutes: int
    locked_position: LockedPosition | None = None
    lock_reason: str | None = None


SERVICE_CATALOG = {
    ServiceCode.BLOOD_TEST: ServiceDefinition(
        code=ServiceCode.BLOOD_TEST,
        name="Xét nghiệm máu",
        room_service_type="blood_test",
        result_turnaround_minutes=25,
        locked_position=LockedPosition.FIRST,
        lock_reason=(
            "Lấy máu trước để mẫu được xử lý trong lúc thực hiện các dịch vụ khác."
        ),
    ),
    ServiceCode.URINE_TEST: ServiceDefinition(
        code=ServiceCode.URINE_TEST,
        name="Nhận mẫu nước tiểu",
        room_service_type="urine_test",
        result_turnaround_minutes=45,
    ),
    ServiceCode.CHEST_XRAY: ServiceDefinition(
        code=ServiceCode.CHEST_XRAY,
        name="Chụp X-quang ngực",
        room_service_type="xray",
        result_turnaround_minutes=10,
    ),
    ServiceCode.ABDOMINAL_ULTRASOUND: ServiceDefinition(
        code=ServiceCode.ABDOMINAL_ULTRASOUND,
        name="Siêu âm bụng",
        room_service_type="ultrasound",
        result_turnaround_minutes=8,
    ),
    ServiceCode.CT_SCAN: ServiceDefinition(
        code=ServiceCode.CT_SCAN,
        name="Chụp CT",
        room_service_type="ct_scan",
        result_turnaround_minutes=15,
    ),
    ServiceCode.DOCTOR_RETURN: ServiceDefinition(
        code=ServiceCode.DOCTOR_RETURN,
        name="Quay lại bác sĩ",
        room_service_type="consultation",
        result_turnaround_minutes=0,
        locked_position=LockedPosition.LAST,
        lock_reason="Chỉ quay lại bác sĩ sau khi các kết quả bắt buộc đã sẵn sàng.",
    ),
}
