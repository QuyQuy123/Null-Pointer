# ĐẶC TẢ TỔNG THỂ GIAO DIỆN NHỊP VIỆN

## 1. Mục đích của tài liệu

Tài liệu này là bản đồ chung cho ba ứng dụng độc lập của NHỊP VIỆN. Mỗi ứng dụng phục vụ một thời điểm và một nhóm người dùng khác nhau:

| Ứng dụng | Thời điểm sử dụng | Người dùng chính | Công việc quan trọng nhất |
|---|---|---|---|
| [Điều phối hành trình khám và xét nghiệm](ui-benh-nhan.md) | Sau khi bác sĩ ký chỉ định | Bệnh nhân hoặc người thân | Chọn ưu tiên, so sánh thứ tự đi các khoa/phòng và thực hiện đúng từng bước |
| [NHỊP HẸN](ui-lich-hen.md) | Trước ngày đến bệnh viện | Bệnh nhân hoặc người thân | So sánh và tự nguyện đổi sang giờ ít đông hơn |
| [Trung tâm điều phối](ui-bang-dieu-hanh.md) | Trong ngày vận hành | Điều phối viên bệnh viện | Phát hiện điểm nghẽn, phê duyệt điều phối và xử lý sự cố |

Ba ứng dụng dùng chung một lõi điều phối nhưng không dùng chung cấu trúc màn hình. Ứng dụng bệnh nhân ưu tiên điện thoại và sự đơn giản. Ứng dụng đặt lịch ưu tiên so sánh rõ ràng. Bảng điều hành ưu tiên máy tính để bàn và mật độ dữ liệu cao.

---

## 2. Ranh giới trách nhiệm

### 2.1. Bác sĩ và hệ thống chuyên môn quyết định

- Bệnh nhân cần làm dịch vụ gì.
- Dịch vụ nào bắt buộc.
- Điều kiện chuẩn bị như nhịn ăn.
- Quan hệ bắt buộc trước và sau.
- Mức ưu tiên y tế.
- Khi nào cần quay lại bác sĩ.

### 2.2. Lõi điều phối NHỊP VIỆN quyết định

- Phòng nào đã được bệnh viện xác nhận đủ khả năng thực hiện dịch vụ.
- Phương án nào có tổng thời gian hoàn tất thấp hơn.
- Phương án nào ít di chuyển hơn.
- Khi nào cần giữ chỗ, tính lại thời gian hoặc tạo cảnh báo.
- Đề xuất nào phải chuyển cho điều phối viên phê duyệt.

### 2.3. Bệnh nhân được lựa chọn

- Một trong các lộ trình đã được xác nhận an toàn.
- Ưu tiên nhanh nhất, ít đi bộ hoặc khu chờ ít đông.
- Đồng ý hoặc từ chối đổi giờ hẹn.
- Đồng ý hoặc từ chối đổi phòng khi có sự cố, nếu kế hoạch cũ vẫn an toàn.
- Kênh nhận thông báo và nhu cầu hỗ trợ di chuyển.

Bệnh nhân không phải tự quyết định xét nghiệm nào cần làm, phòng nào đủ chuyên môn hoặc bước nào được phép bỏ qua.

---

## 3. Luồng liên kết ba ứng dụng

```text
Hệ thống lịch bệnh viện
→ NHỊP HẸN quét các lịch đã đặt
→ Phát hiện khung giờ đông
→ Bệnh nhân tự nguyện đổi hoặc giữ lịch
→ Lịch mới được hệ thống gốc xác nhận

Bệnh nhân đến khám
→ Bác sĩ ký chỉ định
→ Ứng dụng điều phối hành trình nhận các dịch vụ bắt buộc
→ Bệnh nhân chọn điều ưu tiên và một phương án trọn tuyến hợp lệ
→ Bệnh nhân có thể đổi một phòng tương đương; hệ thống tính lại toàn tuyến
→ Giữ chỗ và thực hiện từng bước
→ Quay lại bác sĩ khi đủ kết quả

Trong suốt quá trình
→ Trung tâm điều phối theo dõi toàn cảnh
→ Phát hiện quá tải hoặc thiết bị hỏng
→ Tạo phương án và kiểm tra an toàn
→ Điều phối viên phê duyệt
→ Hành trình bệnh nhân được cập nhật
```

---

## 4. Thuật ngữ dùng chung

| Thuật ngữ | Dịch và giải thích cơ bản |
|---|---|
| **UI, User Interface – Giao diện người dùng** | Phần màn hình, nút, biểu mẫu và thông tin mà người dùng trực tiếp nhìn thấy và thao tác. |
| **UX, User Experience – Trải nghiệm người dùng** | Toàn bộ cảm nhận và mức độ dễ sử dụng của người dùng trong suốt quá trình hoàn thành công việc. |
| **Dashboard – Bảng điều hành** | Màn hình tổng hợp dữ liệu vận hành, cảnh báo và hành động cần xử lý. |
| **MVP, Minimum Viable Product – Sản phẩm khả dụng tối thiểu** | Phiên bản nhỏ nhất có đủ chức năng để chứng minh giá trị của ý tưởng. |
| **Check-in – Xác nhận đã đến** | Thao tác ghi nhận bệnh nhân đã có mặt tại bệnh viện. |
| **Slot – Khung lịch phục vụ** | Khoảng thời gian dành cho một cuộc hẹn hoặc một lượt sử dụng nguồn lực. |
| **ETA, Estimated Time to Service – Thời gian dự kiến được phục vụ** | Khoảng thời gian hệ thống dự báo bệnh nhân sẽ được gọi hoặc hoàn tất một bước. |
| **P50 – Mốc 50 phần trăm** | Mốc mà khoảng một nửa bệnh nhân được phục vụ trước thời điểm đó. |
| **P90 – Mốc 90 phần trăm** | Mốc mà khoảng 90 phần trăm bệnh nhân được phục vụ trước thời điểm đó; giúp nhìn thấy nhóm chờ lâu. |
| **QR, Quick Response – Mã phản hồi nhanh** | Mã hình vuông được quét bằng máy ảnh để xác nhận vị trí hoặc mở thông tin. |
| **SMS, Short Message Service – Tin nhắn văn bản** | Kênh gửi thông báo tới số điện thoại mà không cần điện thoại thông minh. |
| **Audit log – Nhật ký kiểm toán** | Bản ghi ai đã làm gì, lúc nào, dựa trên dữ liệu và quy tắc nào. |
| **Accessibility – Khả năng tiếp cận** | Khả năng sử dụng sản phẩm của người có hạn chế về thị lực, vận động, thính lực hoặc nhận thức. |
| **Responsive design – Thiết kế thích ứng** | Cách bố trí giao diện tự điều chỉnh phù hợp với điện thoại, máy tính bảng và máy tính để bàn. |
| **Design token – Mã thiết kế dùng chung** | Tên đại diện cho màu, khoảng cách, cỡ chữ hoặc độ bo góc để toàn hệ thống dùng nhất quán. |
| **AI, Artificial Intelligence – Trí tuệ nhân tạo** | Phần mềm phân tích dữ liệu để dự báo hoặc xếp hạng phương án; trong hệ thống này AI không thay quyết định chuyên môn. |
| **px, pixel – Điểm ảnh** | Đơn vị nhỏ dùng để mô tả kích thước chữ, khoảng cách và vùng bấm trên màn hình. |

---

## 5. Hệ thiết kế dùng chung

### 5.1. Hướng hình ảnh

Định hướng chung là bình tĩnh, tin cậy, rõ ràng và dễ tiếp cận. Không dùng hiệu ứng kính mờ nặng, màu tím hồng gợi cảm giác sản phẩm AI chung chung hoặc chuyển động trang trí liên tục.

Yếu tố nhận diện là **đường hành trình bệnh viện**:

- Trong ứng dụng bệnh nhân, đường này là tuyến dọc gồm các trạm dịch vụ.
- Trong ứng dụng lịch hẹn, đường này trở thành dải thời gian theo khung giờ.
- Trong bảng điều hành, đường này trở thành bản đồ dòng bệnh nhân giữa các khoa.

Mỗi trạm luôn có tên, trạng thái và hành động rõ ràng. Màu sắc chỉ hỗ trợ nhận biết, không thay thế chữ.

### 5.2. Bảng màu

| Mã thiết kế | Màu | Ý nghĩa |
|---|---|---|
| `mau-chinh` | `#0E7490` | Nút chính, liên kết và điểm nhấn điều phối |
| `mau-chinh-dam` | `#155E75` | Trạng thái nhấn, tiêu đề nổi bật |
| `mau-xac-nhan` | `#047857` | Hoàn tất, xác nhận thành công |
| `mau-canh-bao` | `#B45309` | Gần quá tải hoặc cần chú ý |
| `mau-nguy-hiem` | `#B91C1C` | Sự cố nghiêm trọng hoặc lỗi |
| `mau-thong-tin` | `#1D4ED8` | Thông tin trung tính cần lưu ý |
| `nen-chung` | `#F0FDFA` | Nền tổng thể sáng và dịu |
| `nen-the` | `#FFFFFF` | Nền thẻ và vùng nội dung |
| `chu-chinh` | `#0F172A` | Chữ nội dung chính |
| `chu-phu` | `#475569` | Chữ giải thích phụ |
| `duong-vien` | `#B8D8DE` | Đường chia và viền thành phần |

Tất cả cặp màu chữ và nền phải đạt tỷ lệ tương phản tối thiểu 4,5:1. Trạng thái không chỉ được thể hiện bằng đỏ, vàng hoặc xanh; phải có thêm biểu tượng và chữ.

### 5.3. Kiểu chữ

- Tiêu đề: **Lexend**, phông chữ có hình dáng rõ, hỗ trợ khả năng đọc nhanh.
- Nội dung: **Source Sans 3**, phông chữ dễ đọc ở kích thước nhỏ và hỗ trợ tiếng Việt.
- Số liệu: dùng biến thể chữ số có độ rộng cố định để đồng hồ và số liệu không nhảy vị trí khi cập nhật.

Thang cỡ chữ:

| Vai trò | Cỡ chữ gợi ý |
|---|---:|
| Tiêu đề trang | 28–32 px |
| Tiêu đề khu vực | 22–24 px |
| Tiêu đề thẻ | 18–20 px |
| Nội dung | Tối thiểu 16 px trên điện thoại, 14 px trong bảng điều hành |
| Chú thích | 13–14 px, chỉ dùng khi không phải nội dung chính |

### 5.4. Khoảng cách và hình dạng

- Dùng hệ khoảng cách theo bội số 4 và 8 px.
- Vùng bấm tối thiểu 48 × 48 px trong ứng dụng bệnh nhân và 44 × 44 px trong bảng điều hành.
- Khoảng cách tối thiểu giữa hai vùng bấm là 8 px.
- Thẻ chính bo góc 12 px; nút và trường nhập bo góc 10 px.
- Không dùng quá ba mức bóng đổ.
- Mỗi màn hình chỉ có một hành động chính nổi bật.

### 5.5. Biểu tượng và chuyển động

- Dùng một bộ biểu tượng véc-tơ thống nhất, ví dụ Lucide.
- Không dùng biểu tượng cảm xúc làm biểu tượng chức năng.
- Chuyển động kéo dài khoảng 150–300 mili giây và phải thể hiện quan hệ nguyên nhân–kết quả.
- Hỗ trợ chế độ giảm chuyển động của thiết bị.
- Không chặn thao tác trong lúc hiệu ứng đang chạy.

---

## 6. Quy tắc an toàn giao diện

1. Không hiển thị một phòng cho bệnh nhân nếu phòng đó chưa được xác nhận phù hợp.
2. Không hủy chỗ cũ trước khi chỗ mới được xác nhận.
3. Không dùng một giờ chính xác giả tạo; dùng khoảng thời gian dự kiến và thời điểm cập nhật.
4. Dữ liệu quá cũ phải ghi rõ “Không đủ tin cậy” và dừng đề xuất mới.
5. Mọi thay đổi ảnh hưởng hành trình bệnh nhân trong bản thử nghiệm đều cần điều phối viên phê duyệt.
6. Bệnh nhân từ chối đổi lịch hoặc đổi phòng vẫn giữ quyền lợi hiện tại nếu kế hoạch cũ còn an toàn.
7. Không hiển thị nội dung y khoa chưa được bác sĩ xác nhận.
8. Màn hình công cộng chỉ dùng mã lượt đã che thông tin cá nhân.
9. Mỗi lỗi phải cho biết nguyên nhân và cách phục hồi, không chỉ ghi “Có lỗi xảy ra”.
10. Luôn có đường chuyển sang nhân viên hỗ trợ.

---

## 7. Trạng thái kết nối dùng chung

| Trạng thái | Cách hiển thị | Hành vi hệ thống |
|---|---|---|
| Dữ liệu mới | “Cập nhật 8 giây trước” | Cho phép tạo đề xuất |
| Dữ liệu sắp quá hạn | Cảnh báo kèm thời điểm | Cho phép xem, hạn chế hành động rủi ro |
| Dữ liệu quá hạn | “Không đủ tin cậy” | Dừng đề xuất và yêu cầu làm mới |
| Mất kết nối | Hiển thị dữ liệu gần nhất và thời điểm | Giữ kế hoạch hiện tại, không tự đổi tuyến |
| Dữ liệu mâu thuẫn | Ghi rõ nguồn đang mâu thuẫn | Khóa hành động và chuyển nhân viên xác minh |

---

## 8. Phạm vi bản thử nghiệm 72 giờ

### 8.1. Ứng dụng Điều phối hành trình khám và xét nghiệm

1. Nhận chỉ định mới.
2. Chọn ưu tiên và so sánh ba lộ trình hợp lệ.
3. Xem thứ tự, lý do đề xuất và đổi một phòng tương đương.
4. Giữ chỗ, xác nhận và theo dõi từng bước.
5. Nhận thay đổi khi X-quang gặp sự cố.

### 8.2. Ứng dụng NHỊP HẸN

1. Hiển thị lịch đã đặt.
2. Quét tải ngày mai.
3. So sánh lịch hiện tại với ba khung giờ thay thế.
4. Giữ chỗ mới và xác nhận đổi lịch.
5. Chứng minh lịch cũ không bị mất khi cập nhật thất bại.

### 8.3. Trung tâm điều phối

1. Tổng quan dòng bệnh nhân.
2. Chi tiết khu X-quang.
3. Cảnh báo máy hỏng.
4. Phê duyệt điều phối.
5. Nhật ký quyết định và so sánh trước–sau.

---

## 9. Kịch bản trình diễn liên ứng dụng

```text
Phần 1 – Trước ngày khám
NHỊP HẸN phát hiện 08:00 quá tải
→ Bệnh nhân tự nguyện chuyển sang 10:00
→ Lịch gốc xác nhận
→ Biểu đồ tải được cân bằng

Phần 2 – Sau khi bác sĩ khám
Bác sĩ ký chỉ định lấy máu, X-quang và siêu âm
→ Bệnh nhân chọn ưu tiên hoàn tất sớm
→ Ứng dụng đề xuất lấy máu → X-quang → siêu âm
→ Bệnh nhân xem lý do và xác nhận
→ Hệ thống giữ chỗ
→ Bệnh nhân được hướng dẫn tới nơi tiếp theo

Phần 3 – Khi có sự cố
X-quang 02 gặp lỗi
→ Trung tâm điều phối tạo cảnh báo
→ Điều phối viên phê duyệt chuyển sang X-quang 03
→ Ứng dụng bệnh nhân giải thích thay đổi
→ Hàng chờ và thời gian dự kiến được cập nhật
→ Nhật ký ghi lại toàn bộ quyết định
```

---

## 10. Danh sách kiểm tra chung

- [ ] Ba ứng dụng có đường dẫn và mục tiêu độc lập.
- [ ] Bệnh nhân chỉ chọn giữa các phương án đã được xác nhận phù hợp.
- [ ] Lịch cũ chỉ bị hủy sau khi lịch mới được xác nhận.
- [ ] Mọi thời gian dự kiến đều là khoảng và có thời điểm cập nhật.
- [ ] Không dùng màu làm tín hiệu duy nhất.
- [ ] Toàn bộ nút có thể dùng bằng bàn phím hoặc công nghệ hỗ trợ.
- [ ] Biểu đồ có bảng dữ liệu hoặc tóm tắt chữ thay thế.
- [ ] Sự cố mô phỏng được ghi rõ là dữ liệu giả lập.
- [ ] Có trạng thái tải, rỗng, lỗi và mất kết nối.
- [ ] Mọi quyết định điều phối đều có nhật ký.
