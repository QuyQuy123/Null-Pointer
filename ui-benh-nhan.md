# ỨNG DỤNG 1 — ĐIỀU PHỐI HÀNH TRÌNH KHÁM VÀ XÉT NGHIỆM

> Tài liệu này dùng hệ thiết kế, quy tắc an toàn và [bảng giải thích thuật ngữ chung](ui.md#4-thuật-ngữ-dùng-chung) trong `ui.md`.

## 1. Mục tiêu

Ứng dụng bắt đầu sau khi bác sĩ đã khám và ký các chỉ định. Trọng tâm của ứng dụng là giúp bệnh nhân chọn và thực hiện đúng **thứ tự đi đến các khoa, phòng khám và nơi làm xét nghiệm**. Ứng dụng giúp bệnh nhân:

- Hiểu mình cần thực hiện những dịch vụ nào.
- Chọn điều mình ưu tiên: hoàn tất sớm, ít đi bộ, ít đông hoặc cần tuyến hỗ trợ xe lăn.
- So sánh tối đa ba phương án trọn tuyến đã được bệnh viện xác nhận phù hợp.
- Xem vì sao một phòng và một thứ tự được đề xuất.
- Đổi từng phòng trong danh sách tương đương an toàn; hệ thống tự tính lại toàn bộ các bước sau.
- Giữ chỗ trước khi di chuyển.
- Biết đang ở bước nào, đi đâu tiếp theo và còn chờ khoảng bao lâu.
- Quay lại bác sĩ đúng lúc khi đủ kết quả cần thiết.

Ứng dụng không thay bác sĩ quyết định chuyên môn và không cho bệnh nhân tự bỏ hoặc thay đổi chỉ định.

Trong tài liệu này, **phương án trọn tuyến** là một kế hoạch đầy đủ từ phòng khám hiện tại, qua tất cả dịch vụ bắt buộc, đến lúc quay lại bác sĩ. Bệnh nhân không phải tự ghép nhiều hàng chờ riêng lẻ.

---

## 2. Người dùng và thiết bị

### 2.1. Người dùng chính

- Bệnh nhân.
- Người thân được bệnh nhân cho phép hỗ trợ.
- Nhân viên quầy hỗ trợ khi bệnh nhân không dùng điện thoại.

### 2.2. Thiết bị ưu tiên

- Điện thoại thông minh là thiết bị chính.
- Máy tự phục vụ và máy tính bảng tại quầy là kênh thay thế.
- Tin nhắn văn bản và vé in dùng cho người không có điện thoại thông minh.

Giao diện được thiết kế theo một cột, chữ lớn, vùng bấm rộng và mỗi màn hình chỉ có một hành động chính.

---

## 3. Nguyên tắc lựa chọn an toàn

### 3.1. Bác sĩ quyết định

- Dịch vụ cần thực hiện.
- Điều kiện chuẩn bị.
- Quan hệ bắt buộc trước và sau.
- Mức ưu tiên y tế.
- Kết quả nào phải có trước khi quay lại.

### 3.2. Bệnh viện xác nhận

- Những phòng nào có cùng khả năng thực hiện dịch vụ.
- Phòng nào đang hoạt động.
- Phòng nào có thiết bị và nhân sự phù hợp.
- Phòng nào phù hợp với nhu cầu cách ly hoặc hỗ trợ di chuyển.

### 3.3. Bệnh nhân lựa chọn

- Nhanh nhất toàn hành trình.
- Ít phải đi bộ nhất.
- Khu chờ ít đông hơn.
- Tuyến có thang máy hoặc hỗ trợ xe lăn.

Thông báo bắt buộc trên màn hình chọn lộ trình:

> Các phương án dưới đây đều đã được bệnh viện xác nhận phù hợp với chỉ định của bạn. Lựa chọn của bạn không làm thay đổi chỉ định của bác sĩ.

### 3.4. Hai mức lựa chọn dành cho bệnh nhân

Ứng dụng không mở ngay một danh sách dài các phòng. Bệnh nhân tương tác theo hai mức:

| Mức lựa chọn | Bệnh nhân thực hiện | Hệ thống thực hiện | Mục đích |
|---|---|---|---|
| Mức 1 — Chọn ưu tiên | Chọn “Hoàn tất sớm”, “Ít đi bộ”, “Ít đông” hoặc “Hỗ trợ di chuyển” | Tạo tối đa ba phương án trọn tuyến đã đáp ứng điều kiện y tế | Phù hợp với phần lớn bệnh nhân |
| Mức 2 — Tùy chỉnh phòng | Chọn “Đổi phòng này” tại một bước cụ thể | Chỉ hiển thị phòng tương đương, sau đó tính lại thời gian và thứ tự toàn tuyến | Dành cho người có nhu cầu cụ thể |

Quy tắc bắt buộc:

- Bệnh nhân không tự kéo thả để đổi thứ tự khi thứ tự đó bị khóa bởi chỉ định hoặc điều kiện chuẩn bị.
- Nếu một bước bị khóa, giao diện phải ghi rõ lý do, ví dụ: “Cần lấy máu trước khi dùng thuốc cản quang”.
- Khi bệnh nhân đổi một phòng, kế hoạch mới chỉ được dùng sau khi hệ thống kiểm tra lại tất cả bước sau và bệnh nhân xác nhận.
- Phòng không đủ chuyên môn, thiết bị, điều kiện cách ly hoặc hỗ trợ di chuyển không được xuất hiện trong danh sách.
- Bệnh nhân luôn có thể giữ phương án ban đầu nếu phương án đó vẫn an toàn.

---

## 4. Luồng đầu cuối

```text
Bác sĩ ký chỉ định
→ Hệ thống xác minh dữ liệu
→ Lọc các phòng đủ điều kiện
→ Bệnh nhân chọn điều mình ưu tiên
→ Tạo tối đa ba lộ trình hợp lệ
→ Bệnh nhân so sánh, xem chi tiết và có thể tùy chỉnh phòng
→ Hệ thống tính lại toàn tuyến sau mỗi thay đổi
→ Giữ chỗ tạm thời
→ Xác nhận vào hàng chờ
→ Hướng dẫn di chuyển
→ Theo dõi thời gian chờ
→ Hoàn tất từng dịch vụ
→ Tính lại khi có thay đổi
→ Quay lại bác sĩ khi đủ kết quả
```

### 4.1. Nhận chỉ định

Ví dụ bác sĩ yêu cầu:

1. Xét nghiệm máu.
2. Chụp X-quang.
3. Siêu âm bụng.
4. Quay lại phòng khám khi đủ kết quả.

Ứng dụng hiển thị:

> Bác sĩ đã gửi 3 chỉ định mới. Hệ thống đang kiểm tra điều kiện và tìm lộ trình phù hợp.

### 4.2. Xác minh trước khi tạo lộ trình

Hệ thống phải kiểm tra:

- Đúng người bệnh và đúng lượt khám.
- Chỉ định còn hiệu lực.
- Dịch vụ bắt buộc.
- Điều kiện chuẩn bị.
- Bước bị khóa thứ tự.
- Mức ưu tiên từ nguồn chính thức.
- Nhu cầu hỗ trợ di chuyển.
- Độ mới của trạng thái phòng và thiết bị.

Một phòng chỉ được đưa vào lựa chọn khi đồng thời đáp ứng:

1. Thực hiện đúng dịch vụ được chỉ định.
2. Có thiết bị và nhân sự đang hoạt động.
3. Phù hợp mức ưu tiên, điều kiện cách ly và hỗ trợ di chuyển.
4. Còn khả năng nhận bệnh nhân trong khoảng thời gian cần thiết.
5. Dữ liệu trạng thái còn đủ mới theo quy định của bệnh viện.

Nếu dữ liệu mâu thuẫn, ứng dụng dừng và hiển thị:

> Chỉ định cần được nhân viên xác minh. Vui lòng ở lại khu vực hiện tại và chọn “Nhờ hỗ trợ”.

### 4.3. Tạo lộ trình

Không cho bệnh nhân tự chọn một hàng ngắn rồi bỏ qua ảnh hưởng tới các bước sau. Hệ thống phải tạo lộ trình hoàn chỉnh.

Ví dụ:

| Phương án | Lộ trình | Hoàn tất dự kiến | Di chuyển | Lý do |
|---|---|---:|---:|---|
| Khuyến nghị | Lấy máu tầng 1 → X-quang tầng 2 → Siêu âm tầng 2 | 65–85 phút | 260 m | Tận dụng lúc chờ kết quả máu |
| Ít đi bộ | Lấy máu tầng 1 → X-quang tầng 1 → Siêu âm tầng 1 | 75–95 phút | 110 m | Giảm đổi tầng và quãng đường |
| Ít đông | Lấy máu khu B → X-quang khu B → Siêu âm khu B | 70–90 phút | 320 m | Các khu chờ dự kiến ít người hơn |

Nếu bệnh nhân thay đổi một phòng riêng lẻ, hệ thống phải tính lại toàn bộ phần còn lại trước khi cho xác nhận.

#### 4.3.1. Thông tin hiển thị cho từng phòng

Khi xem chi tiết hoặc đổi phòng, mỗi lựa chọn phải có đủ thông tin để bệnh nhân hiểu, không chỉ hiện tên phòng:

| Thông tin | Ví dụ hiển thị | Ý nghĩa với bệnh nhân |
|---|---|---|
| Địa điểm | “X-quang 03 — tầng 2, khu A” | Biết chính xác phải đi đâu |
| Khoảng chờ | “Dự kiến 10–20 phút” | Biết thời gian chờ có thể dao động |
| Thời gian thực hiện | “Khoảng 10 phút” | Biết thời gian ở trong phòng |
| Kết quả sẵn sàng | “Dự kiến 10:50–11:05” | Biết khi nào có thể quay lại bác sĩ |
| Di chuyển | “Cách 120 m, lên 1 tầng” | So sánh công sức di chuyển |
| Trạng thái | “Đang hoạt động — cập nhật 8 giây trước” | Biết dữ liệu có còn mới hay không |
| Khả năng tiếp cận | “Có thang máy và lối xe lăn” | Biết tuyến có phù hợp nhu cầu hỗ trợ hay không |
| Lý do phù hợp | “Cùng loại máy và được khoa xác nhận” | Hiểu vì sao phòng này xuất hiện |

#### 4.3.2. Cách hệ thống xếp thứ tự

Hệ thống xếp thứ tự theo các nguyên tắc sau:

1. Giữ nguyên các quan hệ trước–sau bắt buộc do bác sĩ hoặc quy trình chuyên môn quy định.
2. Ưu tiên dịch vụ có hạn giờ chuẩn bị, ví dụ siêu âm cần nhịn ăn, trước khi điều kiện không còn phù hợp.
3. Thực hiện bước có thời gian trả kết quả dài sớm hơn nếu an toàn, để kết quả được xử lý trong lúc bệnh nhân làm bước khác.
4. So sánh cả thời gian chờ, thời gian thực hiện, thời gian đi bộ và thời gian trả kết quả; không chỉ nhìn hàng chờ hiện tại.
5. Kiểm tra khả năng tiếp nhận của bước kế tiếp để tránh chuyển bệnh nhân từ một hàng ngắn sang một điểm đang sắp quá tải.
6. Ưu tiên phương án ổn định; không đề nghị đổi chỉ vì chênh lệch rất nhỏ và dễ biến động.

Mỗi đề xuất phải có nút “Vì sao thứ tự này?” và giải thích bằng câu ngắn, ví dụ:

> Lấy máu trước để mẫu được xử lý trong lúc bạn chụp X-quang. Siêu âm được xếp tiếp theo vì bạn đang cần nhịn ăn.

#### 4.3.3. Tình huống minh họa đầy đủ

Các mốc dưới đây là **dữ liệu minh họa cho bản trình diễn**, không phải cam kết thời gian thực tế:

| Thời điểm dự kiến | Bước | Điều đang xảy ra song song |
|---:|---|---|
| 10:00 | Bác sĩ ký chỉ định lấy máu, X-quang và siêu âm | Hệ thống kiểm tra phòng và điều kiện nhịn ăn |
| 10:05–10:15 | Lấy máu tại tầng 1 | Mẫu bắt đầu được chuyển và xử lý |
| 10:20–10:40 | Di chuyển, chờ và chụp X-quang tầng 2 | Mẫu máu tiếp tục được xử lý |
| 10:45–11:05 | Siêu âm tại tầng 2 | Kết quả X-quang và máu được hoàn thiện |
| 11:05–11:20 | Quay lại bác sĩ khi đủ kết quả bắt buộc | Ứng dụng chỉ dẫn đúng phòng khám |

Giá trị của phương án này nằm ở việc các bước được phối hợp thành một hành trình. Bệnh nhân không phải hoàn tất một bước, ngồi chờ kết quả rồi mới tự tìm hàng tiếp theo.

### 4.4. Giữ chỗ

```text
Bệnh nhân chọn lộ trình
→ Kiểm tra lại phòng
→ Giữ chỗ trong thời gian ngắn
→ Bệnh nhân xác nhận
→ Vào hàng chờ chính thức
```

Trong lúc giữ chỗ:

- Khóa nút xác nhận để tránh bấm lặp.
- Hiển thị thời gian giữ chỗ còn lại.
- Có nút “Tôi cần thêm thời gian”.
- Không giải phóng kế hoạch hiện tại trước khi kế hoạch mới được xác nhận.

### 4.5. Di chuyển và xác nhận đã đến

Ứng dụng cung cấp:

- Tên phòng, tầng và khu nhà.
- Sơ đồ đơn giản.
- Hướng dẫn từng bước bằng chữ.
- Tuyến thang máy hoặc xe lăn.
- Thời điểm nên có mặt.
- Nút “Tôi đã đến”.
- Tùy chọn quét mã QR để xác nhận đúng khu vực.

Bản đồ luôn phải có hướng dẫn bằng chữ thay thế.

### 4.6. Chờ và gần đến lượt

Ứng dụng hiển thị ba lớp thông tin:

1. “Bạn đang chờ tại X-quang 03.”
2. “Dự kiến được gọi trong 10–20 phút.”
3. “Các bước cận lâm sàng dự kiến hoàn tất từ 10:45 đến 11:05.”

Luôn kèm:

- Thời điểm cập nhật.
- Trạng thái phòng.
- Lý do khi dự báo thay đổi.
- Chỉ dẫn có được rời khu chờ hay không.
- Thời điểm cần quay lại nếu được phép rời đi.

### 4.7. Hoàn tất từng bước

Sau khi lấy máu:

```text
Mẫu đang được xử lý
→ Bệnh nhân được hướng dẫn sang X-quang
→ Không cần ngồi chờ kết quả máu
```

Chỉ hiển thị trạng thái phục vụ:

- Đã lấy mẫu.
- Đang xử lý.
- Kết quả đã sẵn sàng cho bác sĩ.

Không hiển thị kết luận y khoa chưa được bác sĩ xác nhận.

### 4.8. Quay lại bác sĩ

Khi đủ kết quả bắt buộc:

> Các kết quả cần thiết đã sẵn sàng. Vui lòng quay lại Phòng khám Tim mạch 205.

Khi chưa đủ:

> Kết quả xét nghiệm máu đang được xử lý. Bạn chưa cần quay lại phòng bác sĩ.

---

## 5. Cấu trúc điều hướng

Thanh điều hướng dưới cùng có tối đa bốn mục:

| Mục | Công việc |
|---|---|
| **Hôm nay** | Xem bước hiện tại và hành động cần làm |
| **Hành trình** | Xem toàn bộ các bước và trạng thái |
| **Thông báo** | Xem thay đổi, gần đến lượt và kết quả sẵn sàng |
| **Hỗ trợ** | Gọi nhân viên, xem điểm hỗ trợ và nhu cầu tiếp cận |

Trong khi bệnh nhân đang di chuyển hoặc chờ, màn hình Hôm nay luôn là trang mặc định.

---

## 6. Danh sách màn hình

Chuỗi màn hình chính:

```text
Chỉ định mới
→ Chọn điều ưu tiên
→ So sánh phương án trọn tuyến
→ Xem chi tiết hoặc tùy chỉnh phòng
→ Xác nhận và giữ chỗ
→ Thực hiện từng bước
→ Quay lại bác sĩ
```

Phần đầu của chuỗi phải có chỉ báo tiến trình, tức dòng chữ cho biết bệnh nhân đang ở bước nào trong quá trình chọn kế hoạch, ví dụ “Bước 2/4 — So sánh phương án”.

### 6.1. Màn hình Chỉ định mới

**Mục đích:** giúp bệnh nhân hiểu những việc bắt buộc vừa được bác sĩ yêu cầu.

**Nội dung:**

- Tên bác sĩ và khoa khám.
- Danh sách dịch vụ.
- Điều kiện chuẩn bị.
- Bước bắt buộc làm trước.
- Trạng thái đang tạo phương án.

**Hành động chính:** “Chọn điều tôi ưu tiên”.

**Hành động phụ:** “Nhờ nhân viên hỗ trợ”.

### 6.2. Màn hình Chọn điều ưu tiên

**Mục đích:** để bệnh nhân nói điều quan trọng nhất với mình mà không phải hiểu cách vận hành của bệnh viện.

**Các lựa chọn:**

| Lựa chọn | Mô tả hiển thị |
|---|---|
| Để hệ thống đề xuất | “Cân bằng thời gian, di chuyển và độ ổn định” |
| Hoàn tất sớm | “Ưu tiên tổng thời gian từ bây giờ đến khi quay lại bác sĩ” |
| Ít đi bộ | “Ưu tiên cùng tầng, gần thang máy và quãng đường ngắn” |
| Khu chờ ít đông | “Ưu tiên nơi có số người chờ dự kiến thấp hơn” |
| Hỗ trợ di chuyển | “Chỉ dùng tuyến có lối phù hợp xe lăn hoặc hỗ trợ đã đăng ký” |

Mỗi lựa chọn là một thẻ có tên, mô tả ngắn và dấu chọn rõ ràng. Không dùng màu làm dấu hiệu duy nhất.

**Hành động chính:** “Tạo phương án”.

**Hành động phụ:** “Cập nhật nhu cầu hỗ trợ”.

Khung giao diện gợi ý:

```text
┌──────────────────────────────────┐
│ Bước 2/4 — Chọn điều ưu tiên     │
│ Điều gì quan trọng nhất với bạn? │
├──────────────────────────────────┤
│ ○ Để hệ thống đề xuất            │
│   Cân bằng thời gian và di chuyển │
│                                  │
│ ● Hoàn tất sớm                   │
│   Ưu tiên quay lại bác sĩ sớm    │
│                                  │
│ ○ Ít đi bộ                       │
│ ○ Khu chờ ít đông                │
│ ○ Hỗ trợ di chuyển               │
├──────────────────────────────────┤
│ [Tạo phương án]                  │
│ Cập nhật nhu cầu hỗ trợ          │
└──────────────────────────────────┘
```

### 6.3. Màn hình Chọn lộ trình

**Mục đích:** so sánh tối đa ba phương án hợp lệ.

**Mỗi thẻ phương án hiển thị:**

- Nhãn Khuyến nghị, Ít đi bộ hoặc Ít đông.
- Khoảng thời gian hoàn tất toàn hành trình.
- Thứ tự các khoa, phòng khám và nơi xét nghiệm.
- Khoảng chờ ở từng bước.
- Quãng đường.
- Số lần đổi tầng.
- Lý do đề xuất.
- Thời điểm dữ liệu được cập nhật.

**Hành động chính:** “Chọn lộ trình này”.

**Hành động phụ:** “Xem chi tiết và đổi phòng”.

Không hiển thị điểm kỹ thuật như “AI chấm 87/100” vì bệnh nhân không có cơ sở hiểu điểm đó.

Các phương án xếp dọc, không dùng thao tác vuốt ngang:

```text
┌──────────────────────────────────┐
│ Bước 3/4 — Chọn lộ trình         │
│ Ưu tiên của bạn: Hoàn tất sớm    │
├──────────────────────────────────┤
│ KHUYẾN NGHỊ                      │
│ Hoàn tất dự kiến 65–85 phút      │
│ Lấy máu → X-quang → Siêu âm      │
│ 260 m · đổi tầng 1 lần           │
│ Vì sao: tận dụng lúc chờ kết quả │
│ [Chọn lộ trình này]              │
│ Xem chi tiết và đổi phòng        │
├──────────────────────────────────┤
│ ÍT ĐI BỘ                         │
│ Hoàn tất dự kiến 75–95 phút      │
│ 110 m · không đổi tầng           │
│ [Chọn lộ trình này]              │
└──────────────────────────────────┘
```

### 6.4. Màn hình Chi tiết lộ trình và tùy chỉnh phòng

**Mục đích:** giúp bệnh nhân hiểu toàn bộ thứ tự và chỉ thay đổi một phòng khi thật sự cần.

Màn hình dùng đường dọc biểu diễn hành trình. Mỗi trạm gồm:

- Số thứ tự và trạng thái.
- Tên dịch vụ, khoa hoặc phòng.
- Tầng, khu nhà và quãng đường từ bước trước.
- Khoảng chờ, thời gian thực hiện và thời gian có kết quả.
- Điều kiện cần nhớ, ví dụ tiếp tục nhịn ăn.
- Nút “Vì sao bước này ở đây?”.
- Nút “Đổi phòng này” nếu có phòng tương đương.

Khi chọn “Đổi phòng này”, ứng dụng mở danh sách ngắn các phòng đủ điều kiện. Mỗi phòng hiển thị thông tin tại mục 4.3.1. Sau khi chọn một phòng khác, bệnh nhân xem bản so sánh trước và sau:

| Nội dung | Phương án hiện tại | Sau khi đổi |
|---|---:|---:|
| Hoàn tất dự kiến | 11:05–11:20 | 11:15–11:35 |
| Tổng quãng đường | 260 m | 140 m |
| Số lần đổi tầng | 1 | 0 |
| Bước bị ảnh hưởng | — | X-quang và siêu âm được tính lại |

**Hành động chính:** “Dùng thay đổi này”.

**Hành động phụ:** “Giữ nguyên lộ trình”.

Nếu không còn phòng tương đương, không hiển thị nút đổi phòng; thay vào đó ghi rõ “Hiện chỉ có phòng này đáp ứng chỉ định và điều kiện của bạn”.

Khung giao diện gợi ý:

```text
┌──────────────────────────────────┐
│ Chi tiết lộ trình                │
│ Hoàn tất dự kiến 11:05–11:20     │
├──────────────────────────────────┤
│ 1 ● Lấy máu 01 — tầng 1          │
│   │ Chờ 5–10 phút · làm 5 phút   │
│   │ [Vì sao?] [Đổi phòng này]    │
│   │                              │
│ 2 ○ X-quang 03 — tầng 2          │
│   │ Chờ 10–20 phút · làm 10 phút │
│   │ [Vì sao?] [Đổi phòng này]    │
│   │                              │
│ 3 ○ Siêu âm 05 — tầng 2          │
│   │ Tiếp tục nhịn ăn              │
│   │ [Vì sao?] [Đổi phòng này]    │
│   │                              │
│ 4 ○ Quay lại bác sĩ              │
├──────────────────────────────────┤
│ [Xác nhận lộ trình]              │
└──────────────────────────────────┘
```

### 6.5. Màn hình Xác nhận và giữ chỗ

**Nội dung:**

- Phòng đã chọn.
- Tóm tắt hành trình.
- Điều ưu tiên bệnh nhân đã chọn.
- Khoảng thời gian dự kiến.
- Thời gian giữ chỗ còn lại.
- Thông báo lịch cũ chưa bị giải phóng.

**Hành động chính:** “Xác nhận lộ trình”.

**Hành động phụ:** “Chọn phương án khác”.

Sau khi xác nhận thành công, ứng dụng phải báo rõ “Đã xác nhận lộ trình” và đưa bệnh nhân đến màn hình Hành trình hôm nay. Không hoàn tất âm thầm mà không có phản hồi.

### 6.6. Màn hình Hành trình hôm nay

Đây là màn hình chính sau khi xác nhận.

```text
┌──────────────────────────────────┐
│ Hành trình hôm nay               │
│ Cập nhật 8 giây trước            │
├──────────────────────────────────┤
│ VIỆC CẦN LÀM NGAY                │
│ Đi tới X-quang 03, tầng 2        │
│ Nên có mặt trước 10:20           │
│ [Xem chỉ đường]                  │
├──────────────────────────────────┤
│ ● Đã lấy máu                     │
│ │  Mẫu đang được xử lý           │
│ ◉ X-quang 03 — bước hiện tại     │
│ │  Chờ dự kiến 10–20 phút        │
│ ○ Siêu âm 05 — bước tiếp theo    │
│ │  Tiếp tục nhịn ăn              │
│ ○ Quay lại bác sĩ                │
│    Khi đủ 3 kết quả              │
├──────────────────────────────────┤
│ [Tôi cần hỗ trợ]                 │
└──────────────────────────────────┘
```

Đường dọc và các trạm là yếu tố nhận diện chính. Mỗi trạng thái dùng cả hình dạng, chữ và màu.

### 6.7. Màn hình Chỉ đường

**Nội dung:**

- Điểm bắt đầu và điểm đến.
- Tầng, khu và số phòng.
- Bản đồ.
- Hướng dẫn bằng chữ.
- Tuyến tiếp cận cho xe lăn.
- Điểm hỗ trợ gần nhất.

**Hành động chính:** “Tôi đã đến”.

**Hành động phụ:** “Không tìm thấy phòng”.

### 6.8. Màn hình Đang chờ

**Nội dung:**

- Khoảng thời gian được gọi.
- Trạng thái hàng chờ.
- Thời điểm cập nhật.
- Toàn bộ hành trình dự kiến hoàn tất khi nào.
- Có được rời khu chờ hay không.

**Hành động chính:** tùy trạng thái, ví dụ “Xem bước tiếp theo”.

### 6.9. Màn hình Đề nghị đổi lộ trình

Chỉ xuất hiện khi có sự cố hoặc lợi ích thay đổi đủ lớn.

**Nội dung bắt buộc:**

- Điều gì đã xảy ra.
- Phòng cũ và phòng mới.
- Khoảng thời gian cũ và mới.
- Lợi ích dự kiến.
- Chỗ cũ còn được giữ hay không.
- Điều phối viên đã phê duyệt hay chưa.

**Hành động:** “Đồng ý đổi”, “Giữ lộ trình hiện tại”, “Nhờ hỗ trợ”.

### 6.10. Màn hình Hoàn tất

**Nội dung:**

- Các dịch vụ đã hoàn tất.
- Kết quả nào đã sẵn sàng cho bác sĩ.
- Điểm đến tiếp theo.
- Khoảng thời gian bác sĩ có thể tiếp nhận.

**Hành động chính:** “Chỉ đường quay lại phòng khám”.

### 6.11. Bảng phản hồi cho từng thao tác chính

| Bệnh nhân thao tác | Giao diện phản hồi ngay | Hệ thống xử lý phía sau | Kết quả an toàn |
|---|---|---|---|
| Chọn điều ưu tiên | Đánh dấu lựa chọn và bật nút “Tạo phương án” | Xếp lại các phương án hợp lệ theo ưu tiên | Không thay đổi chỉ định |
| Chọn một lộ trình | Mở bản tóm tắt toàn tuyến | Kiểm tra lại độ mới của phòng và hàng chờ | Không giữ chỗ bằng dữ liệu đã quá hạn |
| Chọn “Đổi phòng này” | Hiện các phòng tương đương và lý do phù hợp | Tính lại thứ tự, thời gian và khả năng nhận của các bước sau | Không cho xác nhận khi tuyến mới vi phạm điều kiện |
| Xác nhận lộ trình | Khóa nút để tránh bấm lặp và hiện trạng thái đang giữ chỗ | Tạo một yêu cầu giữ chỗ duy nhất | Không tạo đăng ký trùng |
| Chọn “Tôi đã đến” | Hiện trạng thái đang xác nhận vị trí | Đối chiếu phòng dự kiến với vị trí hoặc mã tại phòng | Không đưa vào sai hàng chờ |
| Hoàn tất một dịch vụ | Đánh dấu trạm đã xong và làm nổi bước tiếp theo | Nhận trạng thái từ hệ thống chuyên môn rồi tính lại phần còn lại | Không dựa hoàn toàn vào thao tác tự khai của bệnh nhân |
| Từ chối đổi lộ trình | Giữ nguyên trạm và thời gian cũ | Kiểm tra kế hoạch cũ còn an toàn | Không làm mất chỗ cũ |

---

## 7. Xử lý thay đổi lộ trình

Khi máy hỏng hoặc phòng quá tải:

1. Giữ nguyên chỗ hiện tại.
2. Tìm phòng tương đương.
3. Giữ tạm chỗ mới.
4. Tính lại toàn hành trình.
5. Điều phối viên phê duyệt.
6. Hỏi bệnh nhân có đồng ý đổi không.
7. Chỉ giải phóng chỗ cũ sau khi chỗ mới được xác nhận.

Thông báo mẫu:

> Máy X-quang tại phòng hiện tại đang tạm dừng. Hệ thống đã giữ chỗ tại X-quang 03. Nếu chuyển phòng, bạn dự kiến hoàn tất sớm hơn 18–25 phút.

Không dùng thông báo mơ hồ như “Lộ trình đã được cập nhật”.

---

## 8. Trạng thái dữ liệu

```text
Chưa có chỉ định
→ Đã nhận chỉ định
→ Đang chọn điều ưu tiên
→ Đang tạo phương án
→ Đang chọn lộ trình
→ Đang xem chi tiết
→ Đang tính lại sau khi đổi phòng
→ Đang giữ chỗ
→ Đã xác nhận hàng chờ
→ Đang di chuyển
→ Đã đến
→ Đang chờ
→ Đang thực hiện
→ Kết quả đang xử lý
→ Chuyển sang bước tiếp theo
→ Đủ kết quả
→ Quay lại bác sĩ
→ Hoàn tất
```

Trạng thái ngoại lệ:

- Cần xác minh.
- Mất kết nối.
- Phòng tạm dừng.
- Giữ chỗ thất bại.
- Cần nhân viên hỗ trợ.

---

## 9. Trường hợp lỗi

| Trường hợp | Cách xử lý |
|---|---|
| Không còn phòng phù hợp | Yêu cầu bệnh nhân ở lại và gọi nhân viên hỗ trợ |
| Giữ chỗ thất bại | Không làm mất kế hoạch hiện tại; tải lại phương án |
| Trạng thái phòng quá cũ | Không tự chuyển bệnh nhân đến phòng đó |
| Chỉ định và hồ sơ không khớp | Khóa thao tác và yêu cầu xác minh danh tính |
| Quét sai phòng | Không đánh dấu đã đến; hướng dẫn về đúng nơi |
| Mất mạng | Giữ thông tin gần nhất, ghi rõ dữ liệu có thể đã cũ và hiển thị điểm hỗ trợ |
| Máy hỏng khi đang di chuyển | Yêu cầu dừng ở vị trí an toàn và chờ hướng dẫn mới |
| Kết quả chậm | Giải thích nguyên nhân và sắp bước độc lập khác nếu có |
| Bệnh nhân từ chối đổi | Giữ kế hoạch cũ nếu vẫn an toàn |
| Bệnh nhân thấy không khỏe | Dừng luồng điều phối và kết nối nhân viên y tế ngay |

---

## 10. Yêu cầu khả năng tiếp cận

- Nội dung chính tối thiểu 16 px.
- Vùng bấm tối thiểu 48 × 48 px.
- Không bắt buộc thao tác vuốt.
- Không dùng màu làm tín hiệu duy nhất.
- Hỗ trợ phóng to chữ mà không mất nội dung.
- Mọi biểu tượng có nhãn cho trình đọc màn hình.
- Bản đồ có hướng dẫn chữ thay thế.
- Nút “Tôi cần hỗ trợ” luôn dễ tìm.
- Có tuyến dùng thang máy hoặc xe lăn.
- Hỗ trợ người thân thao tác thay theo quyền được cấp.
- Có phương án bằng tin nhắn, máy tự phục vụ, vé in hoặc quầy.
- Chuyển động nhẹ và tôn trọng chế độ giảm chuyển động.

---

## 11. Dữ liệu đầu vào và đầu ra

### 11.1. Đầu vào

- Mã bệnh nhân và mã lượt khám.
- Chỉ định đã được bác sĩ ký.
- Điều kiện chuẩn bị và quan hệ trước–sau.
- Danh sách phòng tương đương đã được phê duyệt.
- Hàng chờ và khối lượng công việc.
- Trạng thái thiết bị.
- Thời gian trả kết quả.
- Nhu cầu hỗ trợ di chuyển.
- Điều bệnh nhân ưu tiên cho hành trình hiện tại.
- Vị trí hiện tại hoặc điểm bắt đầu đã được xác nhận.

### 11.2. Đầu ra

- Lộ trình được chọn.
- Điều ưu tiên và các phòng bệnh nhân đã chủ động thay đổi.
- Chỗ được giữ.
- Trạng thái đã đến và đang chờ.
- Thông báo đã gửi.
- Lựa chọn đồng ý hoặc từ chối đổi lộ trình.
- Thời gian thực tế từng bước.
- Lý do hệ thống đề xuất thứ tự và lịch sử tính lại lộ trình.

---

## 12. Phạm vi phiên bản tối thiểu có thể dùng thử

Bảy màn hình cốt lõi cần xây trước:

1. Chỉ định mới.
2. Chọn điều ưu tiên.
3. Chọn lộ trình.
4. Chi tiết lộ trình và tùy chỉnh phòng.
5. Xác nhận và giữ chỗ.
6. Hành trình hôm nay kèm chỉ đường.
7. Đang chờ và đề nghị đổi lộ trình.

Điều kiện nghiệm thu:

- Luồng chỉ bắt đầu từ chỉ định đã được bác sĩ ký và còn hiệu lực.
- Bệnh nhân chọn được điều ưu tiên trước khi xem phương án.
- Bệnh nhân không nhìn thấy phòng không phù hợp.
- Bệnh nhân xem được tối đa ba phương án trọn tuyến, gồm thứ tự tất cả khoa và nơi xét nghiệm.
- Bệnh nhân hiểu vì sao một thứ tự được đề xuất.
- Bệnh nhân đổi được một phòng tương đương và xem tác động trước khi xác nhận.
- Mọi thay đổi phòng đều làm hệ thống tính lại các bước sau.
- Giữ chỗ không tạo đăng ký lặp.
- Máy X-quang lỗi làm xuất hiện đề nghị thay đổi có giải thích.
- Từ chối đổi không làm mất kế hoạch cũ.
- Sau khi đủ kết quả, ứng dụng hướng dẫn quay lại bác sĩ.
- Mọi thời gian dự kiến đều có dạng khoảng và thời điểm cập nhật.
- Mỗi thao tác quan trọng đều có phản hồi thành công, đang xử lý hoặc lỗi rõ ràng.
- Người dùng chỉ cần thực hiện lần lượt một hành động chính trên mỗi màn hình.
