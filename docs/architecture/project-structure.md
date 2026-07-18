# CẤU TRÚC DỰ ÁN BẮT BUỘC

## 1. Quy tắc chung

Đây là cấu trúc gốc duy nhất. AI và lập trình viên không tự tạo cấu trúc cấp cao khác.

```text
Null-Pointer/
├── AGENTS.md
├── README.md
├── frontend/
├── backend/
├── ai/
├── docs/
└── giaodien/
```

`giaodien/` là giao diện nguyên mẫu để đối chiếu. Không đặt nghiệp vụ, API hoặc dữ liệu sản xuất tại đây.

## 2. Frontend

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── layouts/
│   ├── features/
│   │   ├── patient-home/
│   │   ├── care-routing/
│   │   ├── active-journey/
│   │   ├── hospital-map/
│   │   ├── notifications/
│   │   ├── support/
│   │   └── demo-simulation/
│   ├── entities/
│   │   ├── patient/
│   │   ├── care-route/
│   │   └── journey/
│   ├── shared/
│   │   ├── api/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── ui/
│   ├── mocks/
│   ├── main.tsx
│   └── index.css
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Quy tắc:

- Trang gắn với đường dẫn kết thúc bằng `Page.tsx`.
- Thành phần React dùng PascalCase, ví dụ `RouteOptionCard.tsx`.
- Hook bắt đầu bằng `use`.
- Kiểu dữ liệu dùng `*.types.ts`.
- Kiểm thử đơn vị dùng `*.test.tsx`; kiểm thử toàn luồng dùng `*.spec.ts`.
- Không tạo thư mục `components/` toàn cục ngoài `shared/ui`; thành phần nghiệp vụ nằm trong chính feature.

## 3. Backend

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── core/
│   ├── shared/
│   ├── modules/
│   │   ├── patients/
│   │   ├── encounters/
│   │   ├── clinical_orders/
│   │   ├── facilities/
│   │   ├── queues/
│   │   ├── routing/
│   │   ├── reservations/
│   │   ├── journeys/
│   │   ├── notifications/
│   │   ├── support/
│   │   ├── audit/
│   │   └── simulation/
│   ├── integrations/
│   │   ├── ai/
│   │   ├── his/
│   │   ├── lis/
│   │   ├── ris_pacs/
│   │   └── messaging/
│   └── intelligence/
├── migrations/
├── tests/
├── .env.example
├── pyproject.toml
└── Dockerfile
```

Một mô-đun nghiệp vụ có thể gồm:

```text
module/
├── router.py
├── schemas.py
├── entities.py
├── service.py
├── repository.py
├── sqlalchemy_repository.py
└── exceptions.py
```

Không bắt buộc tạo tất cả tệp khi mô-đun chưa có nghiệp vụ. Không được đặt toàn bộ hệ thống vào một `services/` hoặc `models/` chung.

## 4. AI

Tên chuẩn là `ai/` viết thường để nhất quán trên Windows, Linux và hệ thống triển khai. Không tạo thêm `AI/`, `Ai/` hoặc `ml/`.

```text
ai/
├── config/
│   ├── governance-policy.yaml
│   └── models.yaml
├── src/nhip_vien_ai/
│   ├── api/
│   ├── governance/
│   ├── services/
│   ├── config.py
│   ├── contracts.py
│   └── main.py
├── tests/
├── .env.example
├── pyproject.toml
└── Dockerfile
```

- `contracts.py`: cấu trúc dữ liệu backend và AI thống nhất.
- `services/`: thuật toán xếp tuyến và dự báo chờ.
- `governance/`: chính sách công cụ, kiểm tra đầu vào và nhật ký.
- `config/`: cấu hình mô hình và chính sách, không chứa khóa bí mật.

## 5. Tài liệu

```text
docs/
├── requirements/
├── architecture/
└── development/
```

- `requirements`: hệ thống phải làm gì và quy tắc nào bắt buộc.
- `architecture`: các phần được tổ chức và liên kết ra sao.
- `development`: cách cài đặt, kiểm thử và thay đổi an toàn.

## 6. Khi cần thêm thư mục

Chỉ thêm khi:

1. Không có vị trí phù hợp trong cấu trúc trên.
2. Đã chạy GitNexus để kiểm tra phần liên quan.
3. Đã cập nhật tài liệu này.
4. Không tạo một cấu trúc thay thế song song.
