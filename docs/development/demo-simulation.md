# HỆ THỐNG MÔ PHỎNG DỮ LIỆU BỆNH VIỆN

## 1. Mục đích

Hệ thống mô phỏng cung cấp dữ liệu giả để trình diễn mà không cần kết nối HIS, LIS hoặc RIS/PACS thật.

- **HIS – hệ thống thông tin bệnh viện** quản lý lượt khám và hồ sơ hành chính.
- **LIS – hệ thống thông tin xét nghiệm** quản lý mẫu và kết quả xét nghiệm.
- **RIS/PACS – hệ thống thông tin và lưu trữ ảnh chẩn đoán** quản lý X-quang, CT, MRI và hình ảnh liên quan.

Toàn bộ mã bệnh nhân bắt đầu bằng `DEMO-BN`. Dữ liệu này không phải thông tin của người thật và không được dùng để đưa ra quyết định y tế.

## 2. Dữ liệu được mô phỏng

### Phòng dịch vụ

Mỗi phòng có:

- Mã phòng, tên phòng, khoa, tầng và loại dịch vụ.
- Số bệnh nhân đang chờ.
- Bệnh nhân đang được phục vụ.
- Thời gian phục vụ trung bình.
- Thời gian chờ ước tính.
- Trạng thái phòng: sẵn sàng, đang phục vụ, quá tải hoặc tạm dừng.
- Trạng thái thiết bị: hoạt động hoặc bảo trì.

### Bệnh nhân

Mỗi bệnh nhân giả có:

- Mã ẩn danh dạng `DEMO-BN-001`.
- Mức ưu tiên mô phỏng.
- Danh sách phòng cần đi qua.
- Bước hiện tại và số bước đã hoàn tất.
- Trạng thái chờ, đang phục vụ hoặc đã hoàn tất.

### Sự kiện

Hệ thống ghi lại các sự kiện gần nhất như:

- Bệnh nhân mới đến.
- Bắt đầu phục vụ.
- Hoàn tất một bước và chuyển phòng.
- Hoàn tất toàn bộ hành trình.
- Phòng tạm dừng hoặc mở lại.

## 3. Cách hoạt động

Dữ liệu được giữ trong bộ nhớ của tiến trình backend. **Bộ nhớ trong tiến trình** nghĩa là dữ liệu chỉ tồn tại trong lúc backend đang chạy; khi backend khởi động lại, dữ liệu trở về trạng thái ban đầu.

Mỗi lần bấm `Tiến 5 phút`, bộ mô phỏng thực hiện:

1. Tăng đồng hồ mô phỏng.
2. Giảm thời gian còn lại của bệnh nhân đang được phục vụ.
3. Chuyển bệnh nhân hoàn tất sang phòng tiếp theo.
4. Gọi bệnh nhân tiếp theo trong hàng chờ.
5. Thêm bệnh nhân mới theo chu kỳ để hàng chờ tiếp tục thay đổi.
6. Tính lại trạng thái phòng và thời gian chờ.

Chế độ `Chạy tự động` gọi bước trên theo chu kỳ ba giây để giao diện luôn thay đổi khi trình diễn.

## 4. API điều khiển

**API, Application Programming Interface – giao diện lập trình ứng dụng** là đường trao đổi dữ liệu giữa frontend và backend.

| Phương thức | Đường dẫn | Mục đích |
|---|---|---|
| `GET` | `/api/v1/simulation/snapshot` | Lấy toàn bộ trạng thái mô phỏng |
| `POST` | `/api/v1/simulation/advance` | Tiến đồng hồ mô phỏng từ 1 đến 30 phút |
| `POST` | `/api/v1/simulation/reset` | Khôi phục dữ liệu ban đầu |
| `PATCH` | `/api/v1/simulation/rooms/{room_code}` | Tạm dừng hoặc mở lại một phòng |

Mọi phản hồi đều có `is_demo: true` và thông báo dữ liệu chỉ dùng để trình diễn.

## 5. Cách chạy

Khởi động toàn bộ hệ thống:

```powershell
docker compose up --build
```

Sau đó mở:

```text
http://localhost:5173/demo/simulation
```

Trang nhập và lưu danh mục cận lâm sàng:

```text
http://localhost:5173/demo/hospital-data
```

Chi tiết trường dữ liệu, API và cách thay bộ giả lập bằng kết nối bệnh viện thật nằm trong [tài liệu bộ giả lập dữ liệu cận lâm sàng](hospital-data-simulator.md).

Hoặc chạy frontend và backend riêng theo [hướng dẫn chạy dự án](getting-started.md).

## 6. Thao tác trình diễn đề xuất

1. Mở màn hình mô phỏng và chỉ ra tổng số phòng, số bệnh nhân chờ và thời gian chờ trung bình.
2. Bấm `Tiến 5 phút` để thấy bệnh nhân đổi trạng thái.
3. Bật `Chạy tự động` để dữ liệu cập nhật liên tục.
4. Tạm dừng một phòng đang phục vụ để mô phỏng thiết bị hỏng.
5. Quan sát hàng chờ và thời gian ước tính của phòng đó tăng lên.
6. Mở lại phòng và tiếp tục mô phỏng.
7. Bấm `Đặt lại` để trở về kịch bản ban đầu.

## 7. Giới hạn

- Trạng thái đồng hồ, hàng chờ và bệnh nhân mô phỏng chưa được lưu vào cơ sở dữ liệu.
- Danh mục cận lâm sàng do người vận hành nhập được lưu trong SQLite để dùng lại sau khi khởi động backend.
- Không kết nối hệ thống bệnh viện thật.
- Không mô phỏng kết quả xét nghiệm hoặc chẩn đoán.
- Không được dùng dữ liệu này để đánh giá hay xử trí bệnh nhân thật.
- Khi triển khai sản xuất, mô-đun này phải được tắt hoặc bảo vệ bằng quyền dành riêng cho môi trường trình diễn.

Để tắt toàn bộ đường dẫn mô phỏng, đặt biến môi trường:

```text
DEMO_SIMULATION_ENABLED=false
```
