# BỘ GIẢ LẬP DỮ LIỆU CẬN LÂM SÀNG

## 1. Mục đích

Trang `/demo/hospital-data` cho phép nhập và lưu danh mục cận lâm sàng giống dữ liệu bệnh viện sẽ cung cấp. Dữ liệu được lưu trong SQLite để không mất khi khởi động lại backend.

**SQLite – cơ sở dữ liệu dạng tệp** là cơ sở dữ liệu gọn, lưu toàn bộ dữ liệu cục bộ trong một tệp `nhip_vien.db`. Tệp này đã bị loại khỏi Git vì chỉ phục vụ môi trường chạy tại máy.

Trang không nhận hoặc lưu thông tin bệnh nhân thật.

## 2. Dữ liệu được nhập

| Trường | Ý nghĩa | Ví dụ |
|---|---|---|
| Mã dịch vụ | Mã ổn định dùng để đối chiếu dữ liệu | `LAB-HEMA` |
| Tên cận lâm sàng | Tên người vận hành nhận biết | Huyết học |
| Nhóm dịch vụ | Xét nghiệm, chẩn đoán hình ảnh hoặc nhóm khác | Xét nghiệm |
| Loại phòng phục vụ | Khóa kỹ thuật để ghép dịch vụ với đúng nhóm phòng | Phòng lấy máu |
| Thời gian thực hiện | Thời gian lấy mẫu hoặc thực hiện dịch vụ | 3–5 phút |
| TAT | Khoảng từ khi nhận mẫu đến khi có kết quả | 45–60 phút |
| Nhịn ăn | Không, bắt buộc hoặc tùy loại | Có, 6–10 giờ |
| Quy tắc ưu tiên | Cách bộ điều phối nên đặt dịch vụ vào hành trình | Đưa lên đầu luồng |
| Lưu ý | Ràng buộc người vận hành cần biết | Chỉ ăn sau khi lấy mẫu |
| Phòng / tòa | Nơi có thể thực hiện dịch vụ | `101 K1`, `102 K1` |
| Trạng thái | Dịch vụ có được đưa vào nguồn dữ liệu hay không | Đang dùng |

**TAT, Turnaround Time – thời gian trả kết quả** là thời gian từ khi mẫu hoặc yêu cầu được tiếp nhận đến khi kết quả sẵn sàng.

## 3. Luồng xử lý

```text
Trang nhập liệu
    ↓ POST/PUT/DELETE
API giả lập của backend
    ↓ kiểm tra dữ liệu
ClinicalServiceCatalogService
    ↓ qua ClinicalServiceRepository
SQLiteClinicalServiceRepository
    ↓
Tệp nhip_vien.db
```

`ClinicalServiceRepository` là **repository port – cổng kho dữ liệu**. Đây là hợp đồng quy định backend cần thao tác đọc và lưu nào mà không phụ thuộc dữ liệu đến từ SQLite hay bệnh viện thật.

## 4. API

| Phương thức | Đường dẫn | Mục đích |
|---|---|---|
| `GET` | `/api/v1/simulation/clinical-services?include_inactive=true` | Đọc toàn bộ dữ liệu cho trang quản trị |
| `GET` | `/api/v1/simulation/clinical-services/hospital-feed` | Xem nguồn dữ liệu đang hoạt động theo hợp đồng mô phỏng API bệnh viện |
| `POST` | `/api/v1/simulation/clinical-services` | Thêm dịch vụ |
| `PUT` | `/api/v1/simulation/clinical-services/{code}` | Sửa dịch vụ |
| `DELETE` | `/api/v1/simulation/clinical-services/{code}?expected_version={version}` | Ngừng sử dụng nhưng không xóa lịch sử |
| `POST` | `/api/v1/simulation/clinical-orders` | Gửi các chỉ định đã chọn và yêu cầu hệ thống tìm phòng, tạo lộ trình |
| `GET` | `/api/v1/simulation/patients/{patient_code}/clinical-orders/latest` | Đọc chỉ định và lộ trình mới nhất của một bệnh nhân giả lập |

**API, Application Programming Interface – giao diện lập trình ứng dụng** là quy ước đường dẫn và cấu trúc dữ liệu để các phần mềm trao đổi với nhau.

## 5. Cách thay bằng hệ thống bệnh viện thật

Phần nghiệp vụ đọc qua `ClinicalServiceRepository`, không đọc trực tiếp SQLite. Khi tích hợp thật:

1. Tạo adapter cho HIS, LIS hoặc RIS/PACS theo cùng hợp đồng repository.
2. Chuyển đổi dữ liệu bệnh viện về `ClinicalServiceDefinition`.
3. Thay adapter ở điểm khởi tạo runtime.
4. Giữ nguyên service nghiệp vụ, quy tắc kiểm tra và giao diện tiêu thụ dữ liệu.

**Adapter – bộ chuyển đổi tích hợp** là lớp đổi dữ liệu của một hệ thống bên ngoài sang cấu trúc chung của dự án.

- HIS, Hospital Information System – hệ thống thông tin bệnh viện: quản lý khám, hồ sơ và vận hành tổng thể.
- LIS, Laboratory Information System – hệ thống thông tin xét nghiệm: quản lý mẫu, máy xét nghiệm và kết quả.
- RIS/PACS, Radiology Information System/Picture Archiving and Communication System – hệ thống thông tin chẩn đoán hình ảnh và lưu trữ ảnh y khoa.

## 6. Quy tắc an toàn

- Mã dịch vụ không được đổi sau khi tạo.
- Mọi lần sửa tăng `version` để tránh ghi đè dữ liệu mới bằng một màn hình cũ.
- Ngừng sử dụng là xóa mềm: bản ghi được giữ lại nhưng không xuất hiện trong `hospital-feed`.
- Không nhập tên, mã, chỉ định hoặc kết quả của bệnh nhân thật.
- Bộ giả lập không được thay đổi chỉ định lâm sàng hay mức ưu tiên y tế.

## 7. Gửi chỉ định và điều phối bệnh nhân

Trang `/demo/order-dispatch` mô phỏng phía bệnh viện gửi chỉ định đã được bác sĩ ký. Người vận hành nhập bệnh nhân giả lập, chọn các dịch vụ và gửi yêu cầu. Backend thực hiện lần lượt:

1. Kiểm tra dịch vụ còn hoạt động.
2. Đọc `room_service_type` để xác định loại phòng bắt buộc.
3. Đối chiếu danh sách phòng/tòa được cấu hình với trạng thái phòng hiện tại.
4. Loại phòng tạm dừng, phòng sai loại hoặc thiết bị không hoạt động.
5. Tính các phương án dựa trên hàng chờ, thời gian thực hiện, thời gian trả kết quả và quãng đường.
6. Lưu chỉ định cùng lộ trình để màn hình bệnh nhân nhận được.

Trang `/demo/patient/{patient_code}` mô phỏng màn hình bệnh nhân. Trang tự kiểm tra chỉ định mới mỗi 3 giây và hiển thị điểm đến đầu tiên, toàn bộ dịch vụ, thứ tự phòng cần đến và thời gian dự kiến.

`room_service_type` là **khóa loại phòng – mã phân loại kỹ thuật**. Khóa này giúp hệ thống ghép đúng dịch vụ với phòng mà không suy đoán từ tên tiếng Việt. Ví dụ, `blood_test` chỉ ghép với phòng lấy máu và `urine_test` chỉ ghép với phòng nhận mẫu nước tiểu.
