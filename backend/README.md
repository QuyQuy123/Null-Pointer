# BACKEND FASTAPI

Backend là nguồn quyết định nghiệp vụ và cổng API duy nhất của frontend. Dịch vụ AI chỉ tạo đề xuất; backend kiểm tra lại trước khi trả cho người dùng.

## Chạy

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

## Kiểm tra

```powershell
pytest
ruff check .
```

## Endpoint hiện có

- `GET /health`.
- `POST /api/v1/encounters/{encounter_id}/route-proposals`.
- `POST /api/v1/route-reservations`.
- `POST /api/v1/route-reservations/{reservation_id}/extend`.
- `POST /api/v1/route-reservations/{reservation_id}/confirm`.
- `POST /api/v1/support-requests`.
- `GET /api/v1/simulation/snapshot`.
- `POST /api/v1/simulation/advance`.
- `POST /api/v1/simulation/reset`.
- `PATCH /api/v1/simulation/rooms/{room_code}`.

Endpoint tạo lộ trình dùng bộ tối ưu xác định để đọc trạng thái phòng và hàng chờ mô phỏng, sinh các thứ tự hợp lệ rồi trả tối đa ba phương án. Kết quả vẫn có cờ `is_demo=true` và không được sử dụng để điều phối bệnh nhân thật.

Xem [thuật toán phân luồng](../docs/development/routing-algorithm.md) và [kiến trúc hệ thống](../docs/architecture/system-architecture.md) trước khi sửa mô-đun.
