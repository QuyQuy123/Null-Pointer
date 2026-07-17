# ỨNG DỤNG 2 — NHỊP HẸN

> Tài liệu này dùng hệ thiết kế, quy tắc an toàn và [bảng giải thích thuật ngữ chung](ui.md#4-thuật-ngữ-dùng-chung) trong `ui.md`.

## 1. Mục tiêu

NHỊP HẸN hoạt động trước khi bệnh nhân đến viện. Ứng dụng đọc các lịch đã được đặt trên hệ thống bệnh viện, phát hiện khung giờ có nguy cơ đông và đề xuất bệnh nhân tự nguyện chuyển sang giờ phù hợp hơn.

Ứng dụng kết thúc khi:

- Bệnh nhân đổi lịch thành công.
- Bệnh nhân quyết định giữ lịch hiện tại.
- Không có khung giờ thay thế phù hợp.

Ứng dụng không:

- Tự đổi lịch khi bệnh nhân chưa đồng ý.
- Tự hủy lịch hiện tại.
- Thay đổi mức ưu tiên chuyên môn.
- Chuyển bệnh nhân sang bác sĩ hoặc dịch vụ không phù hợp.
- Thay thế hệ thống đặt lịch gốc của bệnh viện.

---

## 2. Người dùng và thiết bị

### 2.1. Người dùng chính

- Bệnh nhân.
- Người thân quản lý lịch khám theo quyền được cấp.
- Nhân viên tổng đài hoặc quầy hỗ trợ trong trường hợp bệnh nhân không dùng ứng dụng.
- Nhân viên lịch hẹn theo dõi kết quả quét tải, chọn đợt gửi đề xuất và xử lý lỗi đồng bộ.

### 2.2. Thiết bị

- Điện thoại là thiết bị chính của bệnh nhân.
- Trình duyệt máy tính dùng khi người thân quản lý nhiều lịch.
- Tin nhắn văn bản và cuộc gọi là kênh thay thế.

---

## 3. Vấn đề cần giải quyết

Cách đặt lịch thông thường chỉ kiểm tra bác sĩ còn giờ trống hay không. Cách đó có thể bỏ qua tải mà bệnh nhân tạo ra cho xét nghiệm và chẩn đoán hình ảnh.

Ví dụ:

- Khung 08:00 còn một chỗ khám Tim mạch.
- Nhiều bệnh nhân trong khung đó dự kiến cần xét nghiệm.
- Khu xét nghiệm sẽ quá tải lúc 08:45.
- Khung 10:00 có cùng bác sĩ và khu xét nghiệm còn năng lực.
- Chuyển một số bệnh nhân tự nguyện sang 10:00 có thể giảm chờ cho cả hai khung.

NHỊP HẸN phải tính **khối lượng phục vụ dự kiến**, nghĩa là tổng thời gian và nguồn lực mà nhóm bệnh nhân có thể sử dụng, không chỉ đếm số lịch.

---

## 4. Mục tiêu trải nghiệm

Ứng dụng phải giúp bệnh nhân trả lời năm câu hỏi:

1. Lịch hiện tại của tôi là khi nào?
2. Khung giờ đó có nguy cơ đông không?
3. Nếu đổi lịch, tôi có thể giảm khoảng bao nhiêu phút chờ?
4. Khung giờ thay thế có phù hợp với bác sĩ và dịch vụ liên quan không?
5. Việc đổi lịch đã được bệnh viện xác nhận chưa?

Mục tiêu vận hành:

- Làm phẳng số bệnh nhân đến theo từng khung 15 hoặc 30 phút.
- Giảm tập trung đầu buổi.
- Tận dụng khung giờ còn trống.
- Không tạo điểm nghẽn mới ở xét nghiệm hoặc X-quang.
- Không gây bất lợi cho người giữ lịch cũ.

---

## 5. Luồng quét lịch và tạo đề xuất

Trong tài liệu này, “quét lịch” nghĩa là tự động đọc và tổng hợp dữ liệu lịch đã đặt, không phải quét hình ảnh.

```text
Đồng bộ lịch đã đặt
→ Đọc lịch bác sĩ và năng lực phòng
→ Dự báo tải từng khung giờ
→ Phát hiện khung quá đông
→ Chọn bệnh nhân có thể đổi tự nguyện
→ Tìm giờ thay thế
→ Kiểm tra tải các khoa phía sau
→ Xếp hạng phương án
→ Gửi đề xuất
→ Bệnh nhân đổi hoặc giữ lịch
→ Cập nhật hệ thống lịch gốc
```

### 5.1. Dữ liệu được quét

- Lịch hẹn từ một đến bảy ngày tới.
- Số lịch trong từng khung.
- Thời gian khám dự kiến theo loại cuộc hẹn.
- Số bác sĩ và phòng hoạt động.
- Lịch tạm nghỉ hoặc bảo trì.
- Khung vừa có người hủy.
- Tỷ lệ bệnh nhân không đến theo lịch trong quá khứ.
- Tải dự kiến ở xét nghiệm và chẩn đoán hình ảnh.

### 5.2. Tính tải dự kiến

Không chỉ ghi:

> 20 bệnh nhân đã đặt.

Phải thể hiện:

> Nhóm bệnh nhân tương ứng khoảng 360 phút công việc, trong khi nguồn lực chỉ có 240 phút năng lực trong khung đó.

### 5.3. Phát hiện khung giờ đông

Ngưỡng gợi ý cho dữ liệu mô phỏng:

- Dưới 70 phần trăm năng lực: bình thường.
- Từ 70 đến dưới 90 phần trăm: gần đông.
- Từ 90 phần trăm trở lên: nguy cơ quá tải.

Các ngưỡng này chỉ phục vụ bản trình diễn. Bệnh viện thật phải hiệu chỉnh bằng dữ liệu vận hành.

### 5.4. Điều kiện gửi đề xuất

Chỉ gửi khi:

- Lịch không bị ràng buộc bởi yêu cầu chuyên môn về thời điểm.
- Giờ mới còn chỗ thật.
- Lợi ích dự kiến đủ lớn.
- Bệnh nhân chưa nhận quá nhiều đề xuất.
- Bệnh nhân còn đủ thời gian chuẩn bị.
- Việc chuyển không làm khung mới quá tải.
- Tải của các khoa phía sau vẫn nằm trong giới hạn.

---

## 6. Cấu trúc điều hướng

### 6.1. Mặt bệnh nhân

Thanh điều hướng dưới cùng có bốn mục:

| Mục | Chức năng |
|---|---|
| **Lịch của tôi** | Xem lịch sắp tới và trạng thái đồng bộ |
| **Đề xuất** | Xem các giờ ít đông hơn |
| **Thông báo** | Xem lời mời đổi lịch và kết quả xử lý |
| **Cá nhân** | Chọn kênh liên hệ, giờ có thể đến và nhu cầu hỗ trợ |

### 6.2. Mặt nhân viên lịch hẹn

Mặt nhân viên dùng máy tính để bàn và có ba mục:

| Mục | Chức năng |
|---|---|
| **Tải ngày mai** | Xem mức tải theo khoa và khung giờ sau khi quét lịch |
| **Đợt đề xuất** | Chọn nhóm đủ điều kiện và theo dõi phản hồi |
| **Lỗi đồng bộ** | Xử lý lịch chưa xác nhận, trùng chỗ hoặc cần liên hệ thủ công |

Nhân viên không trực tiếp đổi lịch thay bệnh nhân trừ khi bệnh nhân đã xác nhận qua kênh được bệnh viện chấp nhận.

---

## 7. Danh sách màn hình

### 7.1. Màn hình Quét tải lịch ngày mai

Đây là màn hình chứng minh hệ thống đã đọc lịch đặt trước và phát hiện nguy cơ quá tải.

```text
┌──────────────────────────────────────────────────────────────────┐
│ NHỊP HẸN — Tải ngày mai      Quét lần cuối: 09:30                │
├──────────────────────────────────────────────────────────────────┤
│ Khoa: Tim mạch     Ngày: 20/07     [Quét lại dữ liệu]            │
├─────────┬─────────┬────────────┬────────────┬────────────────────┤
│ Khung   │ Lịch đặt│ Năng lực   │ Tải dự kiến│ Trạng thái          │
│ 08:00   │ 26      │ 20         │ 130%       │ Nguy cơ quá tải     │
│ 09:00   │ 18      │ 20         │ 90%        │ Gần đông            │
│ 10:00   │ 11      │ 20         │ 55%        │ Còn khả năng         │
├─────────┴─────────┴────────────┴────────────┴────────────────────┤
│ 12 bệnh nhân đủ điều kiện nhận đề xuất                           │
│ [Xem nhóm bệnh nhân] [Tạo đợt đề xuất]                           │
└──────────────────────────────────────────────────────────────────┘
```

Nội dung:

- Khoa và ngày đang xem.
- Số lịch đã đặt theo từng khung.
- Khối lượng công việc dự kiến.
- Năng lực bác sĩ và phòng.
- Tải dự kiến ở xét nghiệm hoặc X-quang phía sau.
- Các giờ còn khả năng tiếp nhận.
- Số bệnh nhân đủ điều kiện nhận đề xuất.
- Dữ liệu quá hạn hoặc lỗi đồng bộ.

Hành động chính: “Tạo đợt đề xuất”.

Trước khi gửi, nhân viên phải xem:

- Tiêu chí chọn bệnh nhân.
- Giờ thay thế được đề xuất.
- Tải sau khi giả định một số người đồng ý.
- Số thông báo sẽ gửi.
- Kênh liên hệ thay thế cho người không dùng ứng dụng.

### 7.2. Màn hình Lịch khám của tôi

Mỗi thẻ lịch hiển thị:

- Ngày và giờ.
- Chuyên khoa.
- Bác sĩ hoặc phòng khám.
- Địa điểm.
- Trạng thái lịch.
- Mức tải dự kiến bằng chữ và biểu tượng.
- Khoảng thời gian chờ dự kiến.
- Thời điểm dữ liệu cập nhật.

Các trạng thái:

- Đang tải lịch.
- Không có lịch sắp tới.
- Chưa đủ dữ liệu dự báo.
- Lịch bình thường.
- Lịch có nguy cơ đông.
- Không thể đồng bộ với bệnh viện.

### 7.3. Màn hình Phân tích khung giờ hiện tại

Màn hình giải thích vì sao bệnh nhân nên cân nhắc đổi lịch.

Ví dụ:

> Khung 08:00–09:00 dự kiến đông. Bạn có thể phải chờ khoảng 35–50 phút. Khung 10:00–11:00 dự kiến chờ khoảng 10–20 phút.

Thông tin gồm:

- Lịch hiện tại.
- Mức tải phòng khám.
- Tải dự kiến tại xét nghiệm hoặc X-quang nếu liên quan.
- Khoảng thời gian chờ.
- Mức độ tin cậy của dự báo.
- Lợi ích ước tính nếu đổi.
- Lý do giờ mới phù hợp hơn.

Hành động:

- “Xem giờ ít đông hơn”.
- “Giữ lịch hiện tại”.
- “Nhắc lại sau”.

### 7.4. Màn hình So sánh khung giờ

Hiển thị từ ba đến năm lựa chọn tốt nhất.

| Khung giờ | Mức tải | Chờ dự kiến | Lợi ích |
|---|---|---:|---:|
| 08:00 hiện tại | Cao | 35–50 phút | — |
| 09:30 | Trung bình | 20–30 phút | Giảm khoảng 15 phút |
| 10:00 | Thấp | 10–20 phút | Giảm khoảng 25 phút |
| 14:00 | Thấp | 10–15 phút | Giảm khoảng 30 phút |

Bộ lọc:

- Cùng ngày hoặc ngày khác.
- Buổi sáng hoặc buổi chiều.
- Giữ nguyên bác sĩ.
- Bác sĩ khác đã được bệnh viện xác nhận phù hợp.
- Khoảng thời gian bệnh nhân có thể đến.

Quy tắc xếp hạng:

1. Không vi phạm yêu cầu chuyên môn.
2. Bác sĩ và phòng thực sự còn chỗ.
3. Giảm thời gian chờ.
4. Giảm tải cả phòng khám và dịch vụ phía sau.
5. Phù hợp với thời gian bệnh nhân có thể đến.
6. Hạn chế thay đổi bác sĩ và địa điểm.
7. Giữ năng lực dự phòng cho cấp cứu.

### 7.5. Màn hình Xác nhận đổi lịch

So sánh lần cuối:

| Thông tin | Lịch cũ | Lịch mới |
|---|---|---|
| Ngày | 20/07 | 20/07 |
| Giờ | 08:00 | 10:00 |
| Bác sĩ | Nguyễn Văn A | Nguyễn Văn A |
| Chờ dự kiến | 35–50 phút | 10–20 phút |
| Địa điểm | Tầng 2 | Tầng 2 |

Thông báo bắt buộc:

- Lịch cũ vẫn được giữ trong lúc gửi yêu cầu.
- Lịch cũ chỉ bị hủy sau khi lịch mới được xác nhận.
- Thời gian chờ là dự báo, không phải cam kết tuyệt đối.
- Đổi lịch hoàn toàn tự nguyện.

Hành động chính: “Xác nhận đổi lịch”.

Hành động phụ: “Chọn giờ khác” và “Giữ lịch cũ”.

### 7.6. Màn hình Kết quả cập nhật

#### Thành công

- Dấu xác nhận và dòng “Đổi lịch thành công”.
- Mã lịch mới.
- Ngày, giờ, bác sĩ và địa điểm.
- Xác nhận lịch cũ đã được thay thế.
- Nút thêm vào lịch điện thoại.
- Nút gửi cho người thân.

#### Đang xử lý

> Bệnh viện đang xác nhận lịch mới. Lịch cũ của bạn vẫn được bảo lưu. Vui lòng không gửi lại yêu cầu.

#### Thất bại

> Khung 10:00 vừa hết chỗ. Lịch 08:00 của bạn vẫn được giữ nguyên.

Hành động: chọn giờ khác, giữ lịch cũ hoặc liên hệ tổng đài.

### 7.7. Màn hình Lịch sử và lựa chọn cá nhân

Nội dung:

- Lịch sử các đề xuất.
- Các lần đổi lịch thành công.
- Các lần giữ lịch cũ.
- Kênh nhận thông báo.
- Khoảng giờ có thể đến.
- Nhu cầu hỗ trợ di chuyển.
- Người liên hệ thay mặt.
- Tùy chọn tạm dừng đề xuất đổi lịch.

Quy tắc:

- Không gửi lặp cùng một đề xuất.
- Không gửi quá nhiều thông báo trong một ngày.
- Sau khi giữ lịch, không tiếp tục gây áp lực.
- Lựa chọn cá nhân không được dùng để hạ mức ưu tiên chuyên môn.

---

## 8. Luồng người dùng

### 8.1. Đồng ý đổi lịch

1. Hệ thống phát hiện lịch 08:00 có nguy cơ đông.
2. Bệnh nhân nhận thông báo.
3. Bệnh nhân xem lý do.
4. Bệnh nhân so sánh giờ thay thế.
5. Bệnh nhân chọn 10:00.
6. Hệ thống giữ tạm chỗ 10:00.
7. Bệnh nhân xác nhận.
8. Hệ thống lịch gốc cập nhật thành công.
9. Lịch 08:00 được giải phóng.
10. Bệnh nhân nhận mã lịch mới.

### 8.2. Giữ lịch hiện tại

1. Bệnh nhân nhận cảnh báo.
2. Bệnh nhân xem lựa chọn.
3. Bệnh nhân chọn “Giữ lịch 08:00”.
4. Hệ thống ghi nhận và không gửi lại cùng đề xuất.
5. Bệnh nhân vẫn được phục vụ đúng quyền lợi.

### 8.3. Giờ mới vừa hết chỗ

1. Bệnh nhân chọn 10:00.
2. Chỗ vừa được người khác giữ trước.
3. Hệ thống không hủy lịch 08:00.
4. Danh sách giờ được làm mới.
5. Bệnh nhân chọn giờ khác hoặc giữ lịch cũ.

### 8.4. Không có giờ phù hợp

1. Hệ thống phát hiện giờ hiện tại đông.
2. Không có phương án đáp ứng các điều kiện.
3. Hệ thống không gửi đề xuất vô nghĩa.
4. Bệnh nhân chỉ nhận cảnh báo về khoảng chờ và hướng dẫn chuẩn bị.

---

## 9. Giữ chỗ và hoàn tác

**Hoàn tác** là đưa dữ liệu trở lại trạng thái an toàn trước khi thay đổi nếu quy trình mới thất bại.

```text
Bệnh nhân chọn lịch mới
→ Giữ tạm chỗ mới
→ Gửi yêu cầu tới hệ thống lịch gốc
→ Hệ thống lịch gốc xác nhận
→ Hủy lịch cũ
→ Phát hành xác nhận mới
```

Nếu thất bại:

```text
Giải phóng chỗ tạm
→ Giữ nguyên lịch cũ
→ Thông báo rõ cho bệnh nhân
```

Mục tiêu bắt buộc: không có trường hợp bệnh nhân mất cả lịch cũ và lịch mới.

---

## 10. Công bằng

- Đổi lịch phải tự nguyện.
- Từ chối không làm mất lượt hoặc hạ ưu tiên.
- Người không có điện thoại vẫn nhận thông tin qua tin nhắn, tổng đài hoặc quầy.
- Không ưu tiên dựa trên khả năng chi trả.
- Không liên tục yêu cầu cùng một bệnh nhân đổi lịch.
- Không chuyển người khó di chuyển sang giờ bất tiện nếu chưa đồng ý.
- Người đã sắp xếp phương tiện hoặc người chăm sóc được phép giữ lịch.
- Lịch có yêu cầu chuyên môn về thời điểm không được chọn để đổi.
- Theo dõi lợi ích giữa các nhóm tuổi, khả năng di chuyển và kênh liên lạc.
- Luôn giữ năng lực dự phòng cho cấp cứu và người không hẹn trước.

Có thể dùng điểm bảo vệ: mỗi lần bệnh nhân được mời đổi lịch, điểm bảo vệ tăng và người đó ít bị chọn trong các đợt tiếp theo.

---

## 11. Trường hợp lỗi

| Tình huống | Cách xử lý |
|---|---|
| Không kết nối hệ thống lịch gốc | Không cho đổi; giữ lịch cũ và cho phép thử lại |
| Dữ liệu quá cũ | Không hiển thị đề xuất; yêu cầu đồng bộ lại |
| Giờ mới vừa hết chỗ | Giữ lịch cũ; làm mới danh sách |
| Lịch mới tạo nhưng lịch cũ chưa hủy | Đánh dấu cần xác minh; không để bệnh nhân tự xử lý |
| Lịch cũ đã hủy nhưng lịch mới thất bại | Hoàn tác hoặc chuyển ngay cho nhân viên hỗ trợ |
| Hai người chọn cùng một chỗ | Người giữ chỗ thành công trước nhận chỗ |
| Bệnh nhân không phản hồi | Đề xuất hết hạn; lịch cũ không đổi |
| Gửi thông báo thất bại | Thử kênh khác hoặc đưa vào danh sách gọi |
| Dự báo độ tin cậy thấp | Chỉ cảnh báo, không khuyến nghị đổi |
| Giờ mới xung đột lịch khác | Cảnh báo trước khi xác nhận |
| Lịch bác sĩ vừa thay đổi | Hủy đề xuất chưa xác nhận và tạo lựa chọn mới |
| Giờ mới sắp quá tải | Ngừng đề xuất thêm người vào khung đó |

---

## 12. Chỉ số đánh giá

### 12.1. Bệnh nhân

- Số phút chờ dự kiến giảm.
- Số phút chờ thực tế giảm.
- Tỷ lệ đổi lịch thành công.
- Thời gian hoàn tất thao tác.
- Số bệnh nhân mất lịch do lỗi, mục tiêu bằng 0.

### 12.2. Vận hành

- Số bệnh nhân cao nhất trong mỗi khung.
- Mức giảm tải giờ cao điểm.
- Tỷ lệ lấp đầy giờ trước đó còn trống.
- Chênh lệch tải giữa giờ đông và giờ thấp.
- Tỷ lệ đề xuất làm giờ mới quá tải, mục tiêu bằng 0.
- Tỷ lệ lỗi đồng bộ.

### 12.3. Công bằng

- Tỷ lệ các nhóm bệnh nhân nhận đề xuất.
- Số lần trung bình một người được mời đổi.
- Chênh lệch thời gian chờ giữa người dùng ứng dụng và người không dùng.
- Tỷ lệ người từ chối vẫn được phục vụ đúng quyền lợi.

---

## 13. Phạm vi MVP

Sáu màn hình cần xây:

1. Quét tải lịch ngày mai cho nhân viên.
2. Lịch khám của tôi.
3. Phân tích giờ hiện tại.
4. So sánh giờ thay thế.
5. Xác nhận đổi lịch.
6. Kết quả cập nhật.

Kịch bản trình diễn:

```text
Quét 120 lịch ngày mai
→ Phát hiện 08:00 đạt 130 phần trăm năng lực
→ 10:00 mới dùng 55 phần trăm năng lực
→ Chọn bệnh nhân đủ điều kiện
→ Đề xuất chuyển sang 10:00
→ Bệnh nhân so sánh và xác nhận
→ Hệ thống giữ chỗ, cập nhật lịch gốc
→ Tải 08:00 giảm
→ Tải 10:00 tăng nhưng vẫn dưới ngưỡng
```

Điều kiện nghiệm thu:

- Không tự đổi lịch.
- Không mất lịch cũ khi cập nhật thất bại.
- Không đề xuất giờ mới đã quá tải.
- Hiển thị tải của khoa phía sau, không chỉ lịch bác sĩ.
- Giữ lịch cũ không làm giảm quyền lợi.
- Mọi dự báo có dạng khoảng và thời điểm cập nhật.
