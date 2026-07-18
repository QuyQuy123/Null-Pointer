from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class RoomSeed:
    code: str
    name: str
    department: str
    floor: str
    service_type: str
    average_service_minutes: int
    initially_operational: bool = True
    location_code: str | None = None


ROOM_SEEDS = (
    RoomSeed(
        "XN-101",
        "Phòng lấy máu 01",
        "Xét nghiệm",
        "Tầng 1",
        "blood_test",
        8,
        location_code="101 K1",
    ),
    RoomSeed(
        "XN-102",
        "Phòng lấy máu 02",
        "Xét nghiệm",
        "Tầng 1",
        "blood_test",
        10,
        location_code="102 K1",
    ),
    RoomSeed(
        "XN-103",
        "Phòng lấy máu 03",
        "Xét nghiệm",
        "Tầng 1",
        "blood_test",
        9,
        location_code="103 K1",
    ),
    RoomSeed(
        "UR-107",
        "Phòng nhận mẫu nước tiểu 07",
        "Xét nghiệm",
        "Tầng 1",
        "urine_test",
        7,
        location_code="107 K1",
    ),
    RoomSeed(
        "UR-108",
        "Phòng nhận mẫu nước tiểu 08",
        "Xét nghiệm",
        "Tầng 1",
        "urine_test",
        7,
        location_code="108 K1",
    ),
    RoomSeed(
        "XQ-201",
        "Phòng X-quang 01",
        "Chẩn đoán hình ảnh",
        "Tầng 2",
        "xray",
        12,
        location_code="201 K2",
    ),
    RoomSeed(
        "XQ-202",
        "Phòng X-quang 02",
        "Chẩn đoán hình ảnh",
        "Tầng 2",
        "xray",
        12,
        initially_operational=False,
        location_code="202 K2",
    ),
    RoomSeed(
        "SA-203",
        "Phòng siêu âm 03",
        "Chẩn đoán hình ảnh",
        "Tầng 2",
        "ultrasound",
        15,
        location_code="203 K2",
    ),
    RoomSeed(
        "SA-204",
        "Phòng siêu âm 04",
        "Chẩn đoán hình ảnh",
        "Tầng 2",
        "ultrasound",
        18,
        location_code="204 K2",
    ),
    RoomSeed(
        "CT-301",
        "Phòng CT 01",
        "Chẩn đoán hình ảnh",
        "Tầng 3",
        "ct_scan",
        20,
        location_code="301 K3",
    ),
    RoomSeed(
        "PK-305",
        "Phòng khám Tim mạch 05",
        "Khám chuyên khoa",
        "Tầng 3",
        "consultation",
        12,
        location_code="305 K3",
    ),
)


PATIENT_ROUTE_PATTERNS = (
    ("XN-101", "XQ-201", "SA-203", "PK-305"),
    ("XN-102", "SA-204", "PK-305"),
    ("XQ-202", "SA-203", "PK-305"),
    ("CT-301", "PK-305"),
    ("SA-204", "PK-305"),
)

INITIAL_PATIENT_COUNT = 24
