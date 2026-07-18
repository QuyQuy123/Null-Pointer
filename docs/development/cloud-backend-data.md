# Lưu dữ liệu backend khi chạy trên cloud

## 1. Nguyên tắc

Backend là **nguồn dữ liệu duy nhất** của hệ thống. Giao diện mô phỏng và giao diện bệnh nhân không tự lưu phòng, dịch vụ, chỉ định hoặc lộ trình vào trình duyệt.

Mọi thay đổi đều đi theo luồng:

```text
Giao diện mô phỏng -> API backend -> cơ sở dữ liệu backend
Giao diện bệnh nhân <- API backend <- cơ sở dữ liệu backend
```

**API (Application Programming Interface – giao diện lập trình ứng dụng)** là địa chỉ và quy tắc để các phần mềm gửi, nhận dữ liệu.

**Cơ sở dữ liệu** là nơi lưu dữ liệu lâu dài, để dữ liệu vẫn còn sau khi tải lại trang hoặc khởi động lại backend.

## 2. Dữ liệu đang được lưu chung

Tất cả bảng sau dùng cùng biến `DATABASE_URL`:

| Nhóm dữ liệu | Bảng SQLite | Nguồn tạo hoặc cập nhật |
|---|---|---|
| Phòng và trạng thái phòng | `simulation_rooms` | Giao diện mô phỏng |
| Danh mục dịch vụ | `simulation_clinical_services` | Giao diện mô phỏng |
| Chỉ định của bệnh nhân | `simulation_clinical_orders` | Giao diện mô phỏng |
| Phương án lộ trình | `route_proposals` | Thuật toán điều phối backend |
| Chỗ đã giữ, đã xác nhận và tiến độ | `route_reservations` | Giao diện bệnh nhân |

Khi nhân viên gửi chỉ định, backend tìm các phòng phù hợp theo mã dịch vụ, tạo phương án lộ trình rồi lưu cả chỉ định và phương án. Màn hình bệnh nhân đọc chỉ định mới nhất theo mã bệnh nhân, sau đó đọc chỗ đã xác nhận và tiến độ đang thực hiện.

## 3. Chạy trên máy cá nhân

Trong `backend/.env`:

```env
DATABASE_URL=sqlite:///./nhip_vien.db
```

Tệp dữ liệu nằm tại `backend/nhip_vien.db` nếu backend được chạy từ thư mục `backend`.

## 4. Chạy container trên cloud

**Container – gói chạy ứng dụng độc lập** chứa mã backend và các thư viện cần thiết.

Dockerfile mặc định dùng:

```env
DATABASE_URL=sqlite:////data/nhip_vien.db
```

Khi cấu hình dịch vụ cloud:

1. Gắn một **persistent disk (ổ đĩa lưu bền vững – dữ liệu không bị xóa khi ứng dụng khởi động lại)** vào đường dẫn `/data`.
2. Đặt `DATABASE_URL=sqlite:////data/nhip_vien.db`.
3. Đặt `CORS_ORIGINS` bằng địa chỉ frontend thật, ví dụ:

   ```env
   CORS_ORIGINS=["https://nhip-vien.example.com"]
   ```

4. Đặt `APP_ENV=production` và chỉ bật `DOCS_ENABLED` nếu cần trang tài liệu API công khai.

Không gắn ổ đĩa lưu bền vững thì tệp SQLite có thể bị mất mỗi lần nền tảng tạo lại container.

## 5. Cấu hình frontend

Khi dựng frontend, đặt địa chỉ API của backend cloud:

```env
VITE_API_URL=https://api-nhip-vien.example.com/api/v1
```

Frontend phải được dựng lại sau khi đổi `VITE_API_URL` vì đây là biến cấu hình được đưa vào gói giao diện lúc dựng.

## 6. Giới hạn hiện tại

SQLite phù hợp cho bản demo chạy **một phiên bản backend**. Không chạy nhiều bản sao backend cùng ghi vào một tệp SQLite qua mạng.

Nếu cần nhiều bản sao backend, lượng truy cập lớn hoặc vận hành thật, cần chuyển sang **PostgreSQL – hệ quản trị cơ sở dữ liệu máy chủ**, đồng thời bổ sung bộ lưu trữ PostgreSQL cho các kho dữ liệu hiện tại. Mã nguồn hiện tại mới hỗ trợ SQLite; chỉ thay chuỗi `DATABASE_URL` sang PostgreSQL là chưa đủ.

## 7. Cách kiểm tra dữ liệu không bị mất

1. Tạo một phòng và một dịch vụ trên trang mô phỏng.
2. Gửi một chỉ định cho bệnh nhân.
3. Mở màn hình bệnh nhân và xác nhận một lộ trình.
4. Khởi động lại backend.
5. Tải lại cả hai giao diện.
6. Kiểm tra phòng, dịch vụ, chỉ định, lộ trình và bước đang thực hiện vẫn còn.
