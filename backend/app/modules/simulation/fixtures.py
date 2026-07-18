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


ROOM_SEEDS = (
    RoomSeed("XN-101", "Phòng lấy máu 01", "Xét nghiệm", "Tầng 1", "blood_test", 8),
    RoomSeed("XN-102", "Phòng lấy máu 02", "Xét nghiệm", "Tầng 1", "blood_test", 10),
    RoomSeed("XQ-201", "Phòng X-quang 01", "Chẩn đoán hình ảnh", "Tầng 2", "xray", 12),
    RoomSeed(
        "XQ-202",
        "Phòng X-quang 02",
        "Chẩn đoán hình ảnh",
        "Tầng 2",
        "xray",
        12,
        initially_operational=False,
    ),
    RoomSeed("SA-203", "Phòng siêu âm 03", "Chẩn đoán hình ảnh", "Tầng 2", "ultrasound", 15),
    RoomSeed("SA-204", "Phòng siêu âm 04", "Chẩn đoán hình ảnh", "Tầng 2", "ultrasound", 18),
    RoomSeed("CT-301", "Phòng CT 01", "Chẩn đoán hình ảnh", "Tầng 3", "ct_scan", 20),
    RoomSeed("PK-305", "Phòng khám Tim mạch 05", "Khám chuyên khoa", "Tầng 3", "consultation", 12),
)


PATIENT_ROUTE_PATTERNS = (
    ("XN-101", "XQ-201", "SA-203", "PK-305"),
    ("XN-102", "SA-204", "PK-305"),
    ("XQ-202", "SA-203", "PK-305"),
    ("CT-301", "PK-305"),
    ("SA-204", "PK-305"),
)

INITIAL_PATIENT_COUNT = 24
