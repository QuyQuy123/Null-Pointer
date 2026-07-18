# QUY TẮC NGHIỆP VỤ ĐIỀU PHỐI HÀNH TRÌNH

## 1. Cách đọc

Mỗi quy tắc có mã `BR` — Business Rule, nghĩa là quy tắc nghiệp vụ bắt buộc hệ thống phải tuân theo. Giao diện không được bỏ qua quy tắc dù người dùng thao tác theo cách nào.

## 2. Chỉ định và an toàn lâm sàng

| Mã | Quy tắc |
|---|---|
| BR-CLIN-001 | Chỉ sử dụng chỉ định đã được bác sĩ hoặc hệ thống có thẩm quyền ký và còn hiệu lực. |
| BR-CLIN-002 | AI, bệnh nhân và điều phối viên không được tự tạo, bỏ, đổi hoặc suy diễn thêm chỉ định. |
| BR-CLIN-003 | Mức ưu tiên y tế chỉ đến từ nguồn chuyên môn có thẩm quyền. |
| BR-CLIN-004 | Quan hệ trước–sau và điều kiện nhịn ăn luôn có ưu tiên cao hơn mục tiêu giảm chờ. |
| BR-CLIN-005 | Chỉ hướng dẫn quay lại bác sĩ khi đủ kết quả bắt buộc hoặc có chỉ dẫn chính thức. |
| BR-CLIN-006 | Nhãn “Ra khỏi viện nhanh nhất” chỉ là mục tiêu thời gian; bệnh nhân chỉ được rời viện khi lượt khám được xác nhận hoàn tất. |

## 3. Phòng và nguồn lực

| Mã | Quy tắc |
|---|---|
| BR-ROOM-001 | Phòng chỉ xuất hiện nếu bệnh viện xác nhận thực hiện được đúng dịch vụ. |
| BR-ROOM-002 | Phòng phải có thiết bị, nhân sự và điều kiện tiếp cận phù hợp tại thời điểm dự kiến. |
| BR-ROOM-003 | Phòng cách ly hoặc tuyến xe lăn là ràng buộc bắt buộc, không phải tùy chọn để đánh đổi. |
| BR-ROOM-004 | Dữ liệu trạng thái quá cũ không được dùng để giữ chỗ hoặc đề nghị đổi phòng. |
| BR-ROOM-005 | Đổi một phòng phải làm hệ thống tính lại mọi bước bị ảnh hưởng. |

## 4. Lộ trình

| Mã | Quy tắc |
|---|---|
| BR-ROUTE-001 | Một phương án phải bao phủ toàn bộ dịch vụ bắt buộc và bước quay lại bác sĩ. |
| BR-ROUTE-002 | Hệ thống so sánh thời gian chờ, thực hiện, trả kết quả, di chuyển và khả năng tiếp nhận ở bước sau. |
| BR-ROUTE-003 | Không đề nghị đổi chỉ vì chênh lệch nhỏ hơn ngưỡng được bệnh viện cấu hình. |
| BR-ROUTE-004 | Mọi phương án có khoảng thời gian, thời điểm cập nhật và thời hạn hiệu lực. |
| BR-ROUTE-005 | Lý do đề xuất phải được lưu cùng phiên bản thuật toán hoặc bộ quy tắc. |
| BR-ROUTE-006 | Bệnh nhân chỉ chọn `schedule_strategy`; `route_priority` dùng nội bộ với giá trị trung lập `system` trong bản demo. |

## 5. Giữ chỗ và đồng thời

**Đồng thời** là tình huống nhiều người cùng thao tác vào một nguồn lực trong cùng thời điểm.

| Mã | Quy tắc |
|---|---|
| BR-HOLD-001 | Mỗi lần giữ chỗ có mã duy nhất, thời điểm tạo và hết hạn. |
| BR-HOLD-002 | Không xác nhận chỗ đã hết hạn. |
| BR-HOLD-003 | Một yêu cầu xác nhận gửi lặp không được tạo nhiều hành trình. |
| BR-HOLD-004 | Chỗ cũ chỉ được giải phóng sau khi chỗ mới xác nhận thành công. |
| BR-HOLD-005 | Hai người tranh chỗ cuối phải được xử lý bằng khóa hoặc kiểm tra phiên bản tại backend. |
| BR-HOLD-006 | Gia hạn có thể bị từ chối nếu làm ảnh hưởng công suất hoặc người khác đang chờ. |

## 6. Hàng chờ và thời gian dự kiến

| Mã | Quy tắc |
|---|---|
| BR-WAIT-001 | Không hiển thị một giờ chính xác giả tạo; dùng khoảng thời gian. |
| BR-WAIT-002 | Mỗi dự báo có thời điểm cập nhật và nguồn dữ liệu. |
| BR-WAIT-003 | Bệnh nhân chỉ được rời khu chờ khi hệ thống nói rõ khoảng an toàn và thời điểm quay lại. |
| BR-WAIT-004 | Ca cấp cứu có thể làm thay đổi dự báo nhưng không được âm thầm thay đổi chỉ định của bệnh nhân khác. |
| BR-WAIT-005 | Hoàn tất dịch vụ phải đến từ nguồn nghiệp vụ, không từ nút mô phỏng của bệnh nhân. |

## 7. Đổi tuyến khi có sự cố

| Mã | Quy tắc |
|---|---|
| BR-REROUTE-001 | Trước khi hỏi bệnh nhân, hệ thống phải kiểm tra phòng mới và giữ tạm chỗ nếu có thể. |
| BR-REROUTE-002 | Bệnh nhân luôn thấy phòng cũ, phòng mới, thời gian và lợi ích dự kiến. |
| BR-REROUTE-003 | Từ chối đổi không làm mất chỗ cũ nếu kế hoạch cũ vẫn an toàn. |
| BR-REROUTE-004 | Nếu kế hoạch cũ không còn an toàn hoặc không thể phục vụ, chuyển nhân viên hỗ trợ thay vì cho giữ kế hoạch. |
| BR-REROUTE-005 | Thay đổi ảnh hưởng bệnh nhân phải được điều phối viên hoặc quy tắc rủi ro thấp đã phê duyệt xác nhận. |

## 8. AI và bộ tối ưu

| Mã | Quy tắc |
|---|---|
| BR-AI-001 | AI chỉ tạo đề xuất; backend là nơi kiểm tra và quyết định dữ liệu được lưu. |
| BR-AI-002 | AI không truy cập trực tiếp cơ sở dữ liệu bệnh nhân hoặc hàng chờ sản xuất. |
| BR-AI-003 | Dữ liệu gửi sang AI phải được giảm thiểu, ưu tiên mã ẩn danh thay cho tên. |
| BR-AI-004 | Kết quả AI phải qua bộ kiểm tra ràng buộc xác định được trước khi hiển thị. |
| BR-AI-005 | Nếu AI lỗi, quá thời gian hoặc trả dữ liệu sai cấu trúc, hệ thống dùng bộ quy tắc dự phòng hoặc giữ kế hoạch cũ. |
| BR-AI-006 | Mọi lời gọi AI lưu mã yêu cầu, phiên bản mô hình, độ trễ và kết quả kiểm tra; không lưu bí mật. |
| BR-AI-007 | Không dùng văn bản do AI tạo để đưa ra kết luận y khoa. |

## 9. Thông báo và hỗ trợ

| Mã | Quy tắc |
|---|---|
| BR-COMM-001 | Không gửi lặp cùng một thông báo sự kiện nhiều lần. |
| BR-COMM-002 | Thông báo khẩn phải có hành động rõ ràng và kênh hỗ trợ. |
| BR-COMM-003 | Gửi thông báo thất bại không được hoàn tác một thay đổi nghiệp vụ đã xác nhận; phải tạo nhiệm vụ liên hệ thủ công. |
| BR-COMM-004 | Yêu cầu hỗ trợ có mã, loại, vị trí, trạng thái và người xử lý. |

## 10. Trạng thái chuẩn

### Giữ chỗ

```text
held → confirmed
held → expired
held → released
confirmed → cancelled theo quy trình có thẩm quyền
```

### Bước hành trình

```text
pending
→ held
→ navigating
→ arrived
→ waiting
→ in_service
→ result_pending
→ completed
```

Trạng thái ngoại lệ: `blocked` và `cancelled`.

### Đề nghị đổi tuyến

```text
draft → approved → offered → accepted → applied
                         └→ declined
                         └→ expired
```

## 11. Thứ tự kiểm tra một đề xuất

```text
Xác minh lượt khám và chỉ định
→ Kiểm tra ràng buộc chuyên môn
→ Lọc phòng tương đương
→ Kiểm tra thiết bị và nhân sự
→ Kiểm tra nhu cầu tiếp cận
→ Tạo hoặc nhận đề xuất từ AI
→ Kiểm tra lại toàn bộ ràng buộc
→ Tính thời gian và độ mới dữ liệu
→ Lưu đề xuất cùng lý do
→ Bệnh nhân hoặc điều phối viên xác nhận
```

Nếu một bước thất bại, hệ thống không được bỏ qua để tiếp tục.
