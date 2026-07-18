# ĐỐI CHIẾU GIAO DIỆN VỚI YÊU CẦU PHÁT TRIỂN

## 1. Nhãn sử dụng

- **HIỆN CÓ**: giao diện đã hiển thị và thao tác có thay đổi trạng thái trong trình duyệt.
- **MÔ PHỎNG**: dữ liệu cố định, bộ đếm giả hoặc nút chỉ phục vụ trình diễn.
- **SẢN XUẤT**: chức năng phải bổ sung trước khi dùng với dữ liệu bệnh viện thật.

**Nguyên mẫu** là phiên bản minh họa để kiểm tra ý tưởng. **Phiên bản sản xuất** là hệ thống có dữ liệu thật, xác thực, xử lý lỗi và kiểm soát an toàn.

## 2. Bảng truy vết theo màn hình

| Màn hình | Hiện có | Mô phỏng hoặc thiếu | Yêu cầu sản xuất liên quan |
|---|---|---|---|
| Trang chủ | Năm thẻ, hồ sơ, bác sĩ, lịch trong ngày | Dữ liệu ghi cố định; nhiều nút chưa hoạt động | FR-HOME |
| Chỉ định mới | Ba dịch vụ và điều kiện nhịn ăn | Luôn chờ hai giây rồi báo có ba phương án | FR-ORDER |
| Chọn ưu tiên | Năm tiêu chí, mặc định Hoàn tất sớm | Đã gửi riêng ưu tiên và chiến lược lịch sang backend để tính lại | FR-PREF |
| Chọn lộ trình | Ba phương án, chờ, quãng đường và lý do | Đã đọc phương án động từ thuật toán; chưa có dữ liệu bệnh viện thật | FR-ROUTE |
| Chi tiết | Bốn bước, khóa lấy máu, phòng thay thế | Đổi phòng không truyền sang Xác nhận | FR-DETAIL |
| Giữ chỗ | Đồng hồ 120 giây, khóa khi hết hạn | Đã giữ, gia hạn và xác nhận qua backend; dữ liệu còn lưu trong bộ nhớ tạm | FR-HOLD |
| Hành trình | Bốn bước, chỉ đường, cảnh báo | Tiến độ đổi bằng nút mô phỏng | FR-JOURNEY |
| Bản đồ | Ba tầng, tuyến, hướng dẫn chữ | Luôn dẫn tới Lấy máu 01 | FR-MAP |
| Chỉ đường | Điểm đến động một phần, nút đã đến | Hướng dẫn chữ cố định theo X-quang 03 | FR-MAP |
| Đang chờ | Bộ đếm, số người trước, khoảng gọi | Hàng chờ giảm theo công thức cục bộ | FR-WAIT |
| Thông báo | Bốn thông báo, trạng thái đã đọc | Không mở chi tiết hoặc đánh dấu đọc | FR-NOTIFY |
| Hỗ trợ | Xe lăn, thị giác, gọi, SMS, điểm hỗ trợ | Đã tạo yêu cầu backend và trả mã; điểm hỗ trợ vẫn là dữ liệu mẫu | FR-SUPPORT |
| Đổi lộ trình | So sánh phòng cũ, mới và lợi ích | Đồng ý và từ chối đều chỉ đóng lớp phủ | FR-REROUTE |
| Hoàn tất | Ba kết quả và quay lại bác sĩ | Luồng bình thường chưa tới được màn hình | FR-COMPLETE |

## 3. Sai lệch cần xử lý theo thứ tự

1. Hai bộ lựa chọn ưu tiên có ý nghĩa và giá trị mặc định khác nhau.
2. Chiến lược lịch ở trang chủ và ưu tiên lộ trình đã được gửi riêng, nhưng chưa được lưu theo hồ sơ người dùng.
3. Phòng thay thế chưa được truyền xuyên suốt các màn hình.
4. Bản đồ và chỉ đường chưa dùng cùng dữ liệu điểm đến.
5. Hàng chờ luôn dùng dữ liệu của phương án Khuyến nghị.
6. Cảnh báo máy hỏng không phụ thuộc phòng bệnh nhân đã chọn.
7. Nội dung Thông báo và Đề nghị đổi phòng đang không thống nhất phòng cũ, phòng mới.
8. Nút Nhờ nhân viên hỗ trợ ở Bước 1 chuyển sai màn hình.
9. Không tìm thấy phòng chưa mở được màn hình Hỗ trợ.
10. Bước cuối chưa chuyển được tới màn hình Hoàn tất.
11. Hoàn tất xét nghiệm và hoàn tất toàn lượt khám chưa tách rõ.
12. Hồ sơ, chỉ định, hàng chờ theo hành trình và kết quả chưa có API nghiệp vụ; trạng thái phòng hiện dùng API mô phỏng.

## 4. Thứ tự chuyển giao diện nguyên mẫu

1. Giữ `giaodien/` làm mốc đối chiếu, không sửa trực tiếp để biến thành backend-driven.
2. Chuyển kiểu dữ liệu dùng chung sang `frontend/src/entities`.
3. Chuyển từng trang vào feature tương ứng.
4. Thay biến `screen` bằng React Router.
5. Thay dữ liệu cố định bằng API giả lập tại ranh giới mạng.
6. Kết nối API backend thật theo từng luồng.
7. Xóa nút mô phỏng khỏi bản người dùng.
8. Chạy kiểm thử hành vi và so sánh hình ảnh sau mỗi nhóm màn hình.

**API giả lập** là lớp trả dữ liệu mẫu theo đúng hợp đồng mạng, giúp giao diện phát triển trước khi backend hoàn thành.
