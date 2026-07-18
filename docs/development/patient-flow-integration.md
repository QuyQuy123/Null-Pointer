# TÍCH HỢP GIAO DIỆN BỆNH NHÂN VỚI BACKEND

## 1. Nguồn giao diện chuẩn

Thư mục `giaodien/` là mốc đối chiếu trực quan. Mã sản xuất nằm trong:

- `frontend/src/features/patient-flow/`: 17 thành phần màn hình được chuyển từ nguyên mẫu.
- `frontend/src/features/patient-flow/api/`: lớp gọi API backend.
- `frontend/src/features/patient-flow/model/`: kiểu dữ liệu dùng xuyên suốt luồng.

Không sửa trực tiếp `giaodien/` để kết nối backend. Khi Figma Make thay đổi, cần đối chiếu rồi chuyển thay đổi vào `frontend/`.

**API — giao diện lập trình ứng dụng** là hợp đồng để frontend gửi yêu cầu và nhận dữ liệu từ backend.

## 2. Chức năng đã kết nối

| Chức năng giao diện | API | Trạng thái |
|---|---|---|
| Chọn chiến lược lịch và ưu tiên lộ trình | `POST /api/v1/encounters/{encounter_id}/route-proposals` | Đã kết nối |
| Hiển thị tối đa ba phương án động | Cùng API tạo phương án | Đã kết nối |
| Giữ chỗ hai phút | `POST /api/v1/route-reservations` | Đã kết nối |
| Gia hạn giữ chỗ | `POST /api/v1/route-reservations/{id}/extend` | Đã kết nối, tối đa một lần trong bản demo |
| Xác nhận và tạo mã hành trình | `POST /api/v1/route-reservations/{id}/confirm` | Đã kết nối và chống xác nhận lặp |
| Gọi nhân viên, xe lăn, chỉ đường, hỗ trợ thị giác | `POST /api/v1/support-requests` | Đã kết nối |
| Trạng thái phòng và hàng chờ | `/api/v1/simulation/*` | Đã dùng làm đầu vào thuật toán |

**Chống xác nhận lặp** nghĩa là gửi lại cùng yêu cầu không tạo thêm một hành trình mới.

## 3. Quy tắc an toàn đang áp dụng

- Frontend gửi riêng `schedule_strategy` và `priority`.
- Backend kiểm tra phương án có thuộc đúng đề xuất, đúng lượt khám và còn hạn trước khi giữ chỗ.
- Thời gian đếm ngược lấy từ `expires_at` của backend.
- Xác nhận được xử lý trong khóa đồng thời để tránh tạo hai hành trình.
- Phương án hết hạn hoặc không tồn tại trả lỗi rõ ràng, không tự tạo phương án thay thế.

**Khóa đồng thời** là cơ chế chỉ cho một yêu cầu sửa cùng dữ liệu tại một thời điểm ngắn, tránh hai thao tác tranh cùng một chỗ.

## 4. Chức năng vẫn đang mô phỏng trên giao diện

- Hồ sơ lượt khám và chỉ định đã ký.
- Kết quả xét nghiệm.
- Tiến độ từng bước hành trình từ LIS/RIS/PACS.
- Xác nhận đã đến đúng phòng bằng QR hoặc quầy.
- Cập nhật hàng chờ trực tiếp cho bệnh nhân đã xác nhận.
- Thông báo và đánh dấu đã đọc.
- Đề nghị đổi phòng khi thiết bị tạm dừng.
- Đổi phòng trong màn hình chi tiết và tính lại toàn tuyến.
- Bản đồ dùng vị trí thực tế.

Các phần này vẫn hiển thị đúng nguyên mẫu nhưng chưa được coi là dữ liệu nghiệp vụ thật.

## 5. Thứ tự phát triển tiếp theo

1. Tạo API chỉ định đã ký và bối cảnh lượt khám.
2. Tạo kho hành trình, bước hành trình và trạng thái hàng chờ.
3. Nhận sự kiện hoàn tất từ hệ thống xét nghiệm và chẩn đoán hình ảnh.
4. Tạo API đổi phòng, so sánh trước–sau và bảo toàn chỗ cũ.
5. Tạo thông báo trực tiếp và trạng thái đã đọc.
6. Thay bộ nhớ tạm bằng cơ sở dữ liệu có giao dịch.

**Giao dịch cơ sở dữ liệu** là nhóm thao tác hoặc cùng thành công, hoặc cùng được hoàn tác khi có lỗi, giúp không mất chỗ cũ trong lúc đổi tuyến.
