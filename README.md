# NHỊP VIỆN — Điều phối hành trình khám và xét nghiệm

Kho mã này chứa nền tảng điều phối giúp bệnh nhân thực hiện đúng thứ tự lấy máu, X-quang, siêu âm và quay lại bác sĩ với thời gian chờ thấp hơn.

## Cấu trúc chính

```text
Null-Pointer/
├── frontend/   # Ứng dụng React
├── backend/    # API và nghiệp vụ FastAPI
├── ai/         # Tối ưu lộ trình, dự báo và quản trị AI
├── docs/       # Yêu cầu, nghiệp vụ, kiến trúc và hướng dẫn
└── giaodien/   # Giao diện nguyên mẫu dùng để đối chiếu
```

- **React – thư viện xây dựng giao diện web theo thành phần** được dùng trong `frontend/`.
- **FastAPI – khung Python để xây dựng API có kiểm tra dữ liệu** được dùng trong `backend/`.
- **AI, Artificial Intelligence – trí tuệ nhân tạo** được tách tại `ai/`; phần này chỉ tạo đề xuất và không được tự thay đổi chỉ định.

## Tài liệu bắt đầu

1. [Chỉ mục tài liệu](docs/README.md).
2. [Yêu cầu chức năng](docs/requirements/functional-requirements.md).
3. [Quy tắc nghiệp vụ](docs/requirements/business-rules.md).
4. [Kiến trúc hệ thống](docs/architecture/system-architecture.md).
5. [Cấu trúc dự án bắt buộc](docs/architecture/project-structure.md).
6. [Hướng dẫn chạy dự án](docs/development/getting-started.md).
7. [Hướng dẫn hệ thống mô phỏng](docs/development/demo-simulation.md).
8. [Thuật toán phân luồng bệnh nhân](docs/development/routing-algorithm.md).
9. [Quy trình GitNexus](docs/development/gitnexus-workflow.md).
10. [Quy tắc dành cho AI và công cụ tự động](AGENTS.md).

## Khởi chạy nhanh

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

### Dịch vụ AI

```powershell
cd ai
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn nhip_vien_ai.main:app --reload --port 8010
```

Chi tiết cấu hình nằm trong [hướng dẫn phát triển](docs/development/getting-started.md).

Hoặc chạy cả ba phần bằng Docker Compose — công cụ khởi chạy nhiều dịch vụ từ một tệp cấu hình:

```powershell
docker compose up --build
```

## Kiểm thử toàn trình duyệt với Playwright

**Playwright - công cụ tự động điều khiển trình duyệt để kiểm thử giao diện** được cài tại thư mục gốc. Cấu hình dùng chung kiểm tra ứng dụng sản xuất trong `frontend/` trên Chromium, Firefox, WebKit và hai kích thước màn hình di động.

Lần đầu sử dụng:

```powershell
npm install
npm run playwright:install
```

Chạy toàn bộ bài kiểm thử:

```powershell
npm run test:e2e
```

Các lệnh hỗ trợ:

```powershell
npm run test:e2e:chromium
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:report
```

Playwright tự khởi động `frontend/` tại `http://127.0.0.1:5173`. Để kiểm thử một địa chỉ đã chạy sẵn, đặt biến môi trường trước khi chạy:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://dia-chi-can-kiem-thu.example"
npm run test:e2e
```

## Quy tắc quan trọng

- Chỉ sửa mã sau khi kiểm tra GitNexus theo [quy trình bắt buộc](docs/development/gitnexus-workflow.md).
- Không tự tạo cấu trúc thư mục khác với tài liệu kiến trúc.
- Chỉ sửa tài liệu thì không bắt buộc chạy GitNexus.
- `giaodien/` là nguồn đối chiếu hình ảnh; mã sản xuất nằm trong `frontend/`.
