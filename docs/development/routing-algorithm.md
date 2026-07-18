# THUẬT TOÁN PHÂN LUỒNG BỆNH NHÂN

## 1. Mục tiêu

Thuật toán nhận danh sách dịch vụ đã được chỉ định và trạng thái vận hành hiện tại để tạo tối đa ba lộ trình có thể thực hiện.

**Thuật toán xác định** là bộ quy tắc cho cùng đầu vào sẽ tạo cùng kết quả. Phiên bản đầu tiên dùng quy tắc xác định để dễ kiểm tra, giải thích và dùng làm phương án dự phòng khi AI không hoạt động.

Thuật toán không được:

- Tự thêm hoặc bỏ dịch vụ.
- Thay đổi mức ưu tiên lâm sàng.
- Sử dụng phòng đang tạm dừng hoặc bảo trì.
- Trả một lộ trình thiếu dịch vụ chỉ vì không tìm được phòng.

## 2. Đầu vào

API:

```http
POST /api/v1/encounters/{encounter_id}/route-proposals
```

Ví dụ:

```json
{
  "priority": "fastest",
  "schedule_strategy": "balanced",
  "required_service_codes": [
    "blood_test",
    "chest_xray",
    "abdominal_ultrasound",
    "doctor_return"
  ],
  "start_room_code": "PK-305",
  "accessibility": {
    "wheelchair": false,
    "avoid_stairs": false,
    "visual_assistance": false
  }
}
```

### Chiến lược lịch trong ngày

| Giá trị | Ý nghĩa |
|---|---|
| `balanced` | Cân bằng thời gian, hàng chờ và quãng đường |
| `finish_early` | Ưu tiên thời gian được tiếp nhận và hoàn thành các dịch vụ sớm |
| `leave_fast` | Ưu tiên để các kết quả bắt buộc đến tay bác sĩ sớm |

### Tiêu chí lộ trình nội bộ

| Giá trị | Ý nghĩa |
|---|---|
| `system` | Để hệ thống cân bằng |
| `fastest` | Ưu tiên tổng thời gian |
| `less_walk` | Ưu tiên ít đi bộ và ít đổi tầng |
| `less_crowd` | Ưu tiên tổng thời gian hàng chờ thấp |
| `accessible` | Ưu tiên hành trình hỗ trợ di chuyển |

Giao diện bệnh nhân chỉ cho chọn `schedule_strategy`. Bản demo gửi `priority=system` để giữ tiêu chí chọn phòng ở chế độ trung lập; các giá trị còn lại được giữ trong hợp đồng backend để phục vụ kiểm thử và mở rộng sau này.

## 3. Danh mục dịch vụ demo

| Mã | Loại phòng | Thời gian chờ kết quả | Ràng buộc |
|---|---|---:|---|
| `blood_test` | Phòng lấy máu | 25 phút | Làm đầu tiên nếu có trong chỉ định |
| `chest_xray` | Phòng X-quang | 10 phút | Có thể đổi thứ tự với dịch vụ không bị khóa |
| `abdominal_ultrasound` | Phòng siêu âm | 8 phút | Có thể đổi thứ tự với dịch vụ không bị khóa |
| `ct_scan` | Phòng CT | 15 phút | Có thể đổi thứ tự với dịch vụ không bị khóa |
| `doctor_return` | Phòng khám | Không áp dụng | Làm cuối và chỉ bắt đầu khi kết quả sẵn sàng |

Các ràng buộc trên là cấu hình kịch bản demo, không phải kết luận y khoa do thuật toán tự suy diễn. Khi kết nối HIS/LIS/RIS thật, backend phải nhận ràng buộc từ nguồn nghiệp vụ đã được bệnh viện phê duyệt.

## 4. Các bước xử lý

```text
Nhận danh sách dịch vụ
→ Đọc trạng thái phòng và hàng chờ mới nhất
→ Loại phòng tạm dừng hoặc bảo trì
→ Tìm phòng có đúng loại dịch vụ
→ Khóa dịch vụ bắt buộc ở đầu hoặc cuối
→ Sinh các thứ tự còn lại
→ Ghép từng dịch vụ với các phòng phù hợp
→ Ước lượng di chuyển, hàng chờ, thực hiện và trả kết quả
→ Chấm điểm theo chiến lược và tiêu chí
→ Chọn tối đa ba phương án khác nhau
→ Kiểm tra lại đủ toàn bộ dịch vụ
→ Trả kết quả cùng phiên bản thuật toán
```

## 5. Ước lượng thời gian

Với mỗi bước, thuật toán tính:

- Thời gian di chuyển từ phòng trước.
- Thời điểm dự kiến tới phòng.
- Hàng chờ dự kiến còn lại khi bệnh nhân tới.
- Khoảng chờ tối thiểu và tối đa.
- Thời gian thực hiện dịch vụ.
- Thời điểm hoàn tất dịch vụ.
- Thời điểm kết quả sẵn sàng.

Nếu bệnh nhân đang làm dịch vụ khác trong lúc hàng chờ giảm, thuật toán trừ khoảng thời gian đã trôi qua khỏi dự báo hàng chờ. Vì vậy, hệ thống không cộng nguyên toàn bộ hàng chờ của từng phòng một cách máy móc.

Bước quay lại bác sĩ chỉ bắt đầu sau thời điểm muộn nhất trong các kết quả bắt buộc.

## 6. Cách chọn ba phương án

Thuật toán trả tối đa:

1. `recommended`: phương án phù hợp `priority` và `schedule_strategy` người dùng đã chọn.
2. `less_walk`: phương án khác có quãng đường và số lần đổi tầng thấp.
3. `less_crowd`: phương án khác có tổng hàng chờ dự kiến thấp.

Mỗi phương án có câu giải thích bằng tiếng Việt. Điểm kỹ thuật `ranking_score` chỉ phục vụ kiểm thử và nhật ký; giao diện không nên dùng điểm này làm lời giải thích cho bệnh nhân.

## 7. Cơ chế thất bại an toàn

**Thất bại an toàn** nghĩa là hệ thống dừng và báo rõ lỗi thay vì tạo kết quả không đầy đủ.

Backend trả mã `409 Conflict` khi không có phòng đang hoạt động cho một dịch vụ bắt buộc. Ví dụ, nếu tất cả phòng X-quang đều tạm dừng, hệ thống không bỏ bước X-quang để tiếp tục.

Backend trả mã `422 Unprocessable Entity` khi:

- Mã dịch vụ không nằm trong danh mục được hỗ trợ.
- Một dịch vụ xuất hiện lặp lại.
- Danh sách dịch vụ rỗng hoặc vượt giới hạn.

## 8. Dữ liệu đầu ra quan trọng

- `algorithm_version`: phiên bản thuật toán.
- `simulation_tick`: phiên bản trạng thái mô phỏng đã dùng.
- `required_service_codes`: danh sách dịch vụ đầu vào được giữ nguyên.
- `duration_minutes_min/max`: khoảng hoàn tất toàn hành trình.
- `tests_completed_minutes`: thời gian làm xong các dịch vụ xét nghiệm/hình ảnh.
- `results_ready_minutes`: thời gian đủ kết quả.
- `doctor_return_minutes`: thời gian hoàn tất bước quay lại bác sĩ.
- `total_wait_minutes`: tổng chờ dự kiến.
- `distance_meters`: quãng đường dự kiến.
- `warnings`: cảnh báo dữ liệu demo và các phòng đã bị loại.

## 9. Giới hạn phiên bản đầu tiên

- Chỉ sử dụng dữ liệu mô phỏng trong bộ nhớ.
- Chưa giữ chỗ thật tại các phòng.
- Chưa xử lý nhiều bệnh nhân cùng xác nhận một chỗ tại cùng thời điểm.
- Chưa lấy chỉ định và ràng buộc từ HIS/LIS/RIS.
- Chưa dùng AI để xếp hạng; bộ tối ưu xác định đang là bộ quyết định chính.
- Tất cả phòng demo được giả định có lối tiếp cận. Khi có dữ liệu cơ sở vật chất thật, phải lọc theo xe lăn, thang máy và hỗ trợ thị giác trước khi chấm điểm.
