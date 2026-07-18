# ỨNG DỤNG ĐIỀU PHỐI HÀNH TRÌNH KHÁM VÀ XÉT NGHIỆM

> Tài liệu này mô tả đúng giao diện nguyên mẫu hiện có trong thư mục `giaodien/src/app`. **Giao diện nguyên mẫu** (prototype — phiên bản mô phỏng dùng để trình diễn và kiểm thử ý tưởng) chưa phải hệ thống bệnh viện hoàn chỉnh. Các số phòng, thời gian và thông tin bệnh nhân trong tài liệu là dữ liệu minh họa.

## 1. Phạm vi đối chiếu

Nguồn giao diện được dùng để cập nhật tài liệu:

- `giaodien/src/app/App.tsx`: luồng chuyển màn hình và trạng thái chung.
- `giaodien/src/app/components/`: nội dung và thao tác của từng màn hình.
- `giaodien/src/styles/`: màu sắc, phông chữ và kích thước hiển thị.

Một số thuật ngữ dùng trong tài liệu:

- **Màn hình** (screen — một trang giao diện phục vụ một nhiệm vụ chính).
- **Thẻ điều hướng** (tab — nút đổi giữa các nhóm nội dung trên cùng một màn hình).
- **Trạng thái** (state — dữ liệu tạm thời xác định giao diện đang hiển thị gì).
- **Dòng thời gian** (timeline — danh sách các bước được xếp theo thứ tự thời gian).
- **Bảng trượt từ dưới lên** (bottom sheet — bảng lựa chọn xuất hiện từ cạnh dưới màn hình).
- **Lớp phủ** (overlay — nội dung nổi che tạm thời lên màn hình hiện tại).

### 1.1. Kết quả đối chiếu chính

| Nội dung | Giao diện hiện có | Cách tài liệu này mô tả |
|---|---|---|
| Điểm bắt đầu | Trang chủ tổng quan | Luồng bắt đầu tại Trang chủ, sau đó đi vào chỉ định mới |
| Điều hướng Trang chủ | 5 thẻ: Hôm nay, Chỉ định, Kết quả, Lịch trình, Hỗ trợ | Mô tả đủ từng thẻ và hành động |
| Chiến lược sắp lịch trình | 3 lựa chọn | Cân bằng, Ưu tiên thời gian vào khám, Ưu tiên kết quả đến tay bác sĩ |
| Giá trị chọn sẵn | Cân bằng | Ghi rõ đây là lựa chọn mặc định của giao diện |
| Phương án lộ trình | 3 thẻ cố định | Khuyến nghị, Ít đi bộ, Ít đông |
| Thời gian trên thẻ lộ trình | Một khoảng “Hoàn tất dự kiến” | Không tách thành ba mốc xong xét nghiệm, gặp bác sĩ và ra viện vì giao diện chưa hiển thị như vậy |
| Điều hướng sau xác nhận | 4 mục ở đáy màn hình | Hôm nay, Hành trình, Thông báo, Hỗ trợ |
| Màn hình bổ sung | Trang chủ, Bản đồ, Kết quả, Thông báo, Hỗ trợ | Được bổ sung vào tài liệu |

---

## 2. Mục tiêu và giới hạn an toàn

Ứng dụng hỗ trợ bệnh nhân sau khi bác sĩ khám và ký chỉ định. Mục tiêu là giúp bệnh nhân:

- Nhìn thấy các dịch vụ phải thực hiện.
- Hiểu điều kiện chuẩn bị như nhịn ăn.
- Chọn tiêu chí ưu tiên cho hành trình.
- So sánh các lộ trình đã được bệnh viện xác nhận phù hợp.
- Xem thứ tự đi lấy máu, chụp X-quang, siêu âm và quay lại bác sĩ.
- Đổi một phòng tương đương khi giao diện cho phép.
- Giữ chỗ, xem chỉ đường, theo dõi hàng chờ và nhận thông báo thay đổi.

Ứng dụng không được thay bác sĩ quyết định:

- Dịch vụ nào là bắt buộc.
- Bước nào phải làm trước hoặc sau.
- Mức ưu tiên y tế.
- Điều kiện nhịn ăn, cách ly hoặc dùng thuốc.
- Thời điểm bệnh nhân được phép kết thúc lượt khám hoặc rời bệnh viện.

Thông báo an toàn đang xuất hiện trên màn hình Chọn lộ trình:

> Các phương án dưới đây đều đã được bệnh viện xác nhận phù hợp với chỉ định của bạn. Lựa chọn của bạn không làm thay đổi chỉ định của bác sĩ.

---

## 3. Cấu trúc giao diện hiện tại

Ứng dụng được trình bày theo một cột, ưu tiên điện thoại và giới hạn chiều rộng tối đa 430 px.

### 3.1. Luồng tổng thể

```text
Trang chủ
→ Hôm nay
→ Xem chỉ định
→ Chỉ định
→ Xem lịch trình
→ Lịch trình
→ Xem hành trình xét nghiệm
→ Chỉ định mới
→ Chọn điều ưu tiên
→ Chọn lộ trình
→ Xem chi tiết và đổi phòng (không bắt buộc)
→ Xác nhận và giữ chỗ
→ Hành trình hôm nay
→ Chỉ đường
→ Đang chờ
→ Bước tiếp theo
→ Quay lại bác sĩ
```

Từ thẻ Lịch trình, bệnh nhân cũng có thể mở Bản đồ bệnh viện trực tiếp.

### 3.2. Luồng sau khi xác nhận

Thanh điều hướng dưới cùng chỉ xuất hiện trên các màn hình đang thực hiện hành trình:

| Mục | Nội dung |
|---|---|
| Hôm nay | Bước hiện tại, việc cần làm ngay và đường đi |
| Hành trình | Toàn bộ bốn bước cùng trạng thái hoàn tất, hiện tại hoặc chưa làm |
| Thông báo | Sự cố thiết bị, gần đến lượt, kết quả sẵn sàng và xác nhận lộ trình |
| Hỗ trợ | Gọi nhân viên, đăng ký hỗ trợ di chuyển và xem điểm hỗ trợ gần nhất |

Biểu tượng Thông báo hiện huy hiệu số `2`, nghĩa là giao diện minh họa có hai thông báo chưa đọc.

---

## 4. Hệ thống trình bày

### 4.1. Màu sắc và phông chữ

| Thành phần | Giá trị đang dùng | Mục đích |
|---|---|---|
| Màu chính | Xanh ngọc `#0B6E6E` | Nút chính, tiêu đề và trạng thái đang hoạt động |
| Nền | Xanh xám rất nhạt `#F0F5F8` | Tách thẻ trắng khỏi nền |
| Cảnh báo | Vàng hổ phách | Chỉ định mới, điều kiện nhịn ăn và sự cố |
| Thành công | Xanh lá | Hoàn tất bước hoặc có kết quả |
| Nguy hiểm | Đỏ `#DC2626` | Điểm đến trên bản đồ hoặc lỗi nghiêm trọng |
| Phông chữ | Inter | Phông chữ không chân, dễ đọc trên điện thoại |

### 4.2. Cấu trúc thao tác

- Nút chính cao khoảng 52–56 px.
- Nút phụ cao khoảng 44–48 px.
- Thẻ lựa chọn ưu tiên cao tối thiểu 72 px.
- Luồng chọn kế hoạch dùng chỉ báo `Bước 1/4` đến `Bước 4/4`.
- Trạng thái không chỉ thể hiện bằng màu; giao diện còn dùng chữ, biểu tượng và đường viền.
- Các màn hình chính dùng một hành động nổi bật, sau đó mới đến hành động phụ.

---

## 5. Mô tả chi tiết từng màn hình

### 5.1. Trang chủ tổng quan

**Tên thành phần:** `DashboardScreen.tsx`.

Đây là màn hình đầu tiên khi mở ứng dụng.

#### Phần đầu trang

- Tên cơ sở: Bệnh viện Đa khoa TW.
- Nút Thông báo và Hồ sơ.
- Bệnh nhân: Nguyễn Thị Mai.
- Ngày sinh: 12/03/1968; nữ; 58 tuổi.
- Mã bệnh nhân: BN-00847.
- Trạng thái: Đang khám.
- Mã lượt khám: TM-2026-00847.
- Bác sĩ phụ trách: BS. Trần Văn Hùng.

#### Năm thẻ điều hướng

##### A. Hôm nay

- Cảnh báo “Bác sĩ vừa gửi 3 chỉ định mới”.
- Ba dịch vụ: Xét nghiệm máu, X-quang và Siêu âm bụng.
- Nút `Xem chỉ định` chuyển sang thẻ Chỉ định.
- Dòng thời gian gồm đăng ký khám, đo sinh hiệu, khám bác sĩ và hành trình xét nghiệm.
- Hành trình xét nghiệm lúc 10:05 được đánh dấu “Cần bắt đầu ngay”.

##### B. Chỉ định

Hiển thị ba chỉ định:

1. Xét nghiệm máu, mã `XN-MAU-001`, cần nhịn ăn ít nhất 4 giờ và được đánh dấu `Làm trước`.
2. Chụp X-quang ngực, mã `XQ-NGUC-002`, không có điều kiện đặc biệt.
3. Siêu âm bụng, mã `SA-BUNG-003`, tiếp tục nhịn ăn.

Nút `Xem lịch trình` chuyển sang thẻ Lịch trình.

##### C. Kết quả

- Tóm tắt `1/3 kết quả đã sẵn sàng`.
- X-quang có kết quả lúc 11:08.
- Xét nghiệm máu và siêu âm hiển thị `Chưa có`.
- Khi có kết quả, giao diện hiện nút `Xem kết quả chi tiết`.

Giao diện chỉ nên hiển thị trạng thái có kết quả; kết luận y khoa phải do hệ thống chuyên môn hoặc bác sĩ cung cấp.

##### D. Lịch trình

Hiển thị ngày, mã lượt khám, tiến độ `2/6 bước` và sáu mốc:

1. Đăng ký khám và đo sinh hiệu.
2. Khám với BS. Trần Văn Hùng.
3. Xét nghiệm máu.
4. Chụp X-quang ngực.
5. Siêu âm bụng.
6. Tái khám để nhận kết quả.

Thẻ Lịch trình có ba lựa chọn riêng:

| Lựa chọn | Mô tả trên giao diện | Thời gian hiển thị |
|---|---|---|
| Cân bằng | Cân bằng thời gian chờ, di chuyển và thời điểm trả kết quả | Tính từ dữ liệu hiện tại |
| Ưu tiên thời gian vào khám | Ưu tiên được tiếp nhận và hoàn thành các dịch vụ sớm; có thể chờ bác sĩ lâu hơn | Tính từ dữ liệu hiện tại |
| Ưu tiên kết quả đến tay bác sĩ | Sắp xếp để các kết quả bắt buộc đến tay bác sĩ trong thời gian sớm nhất | Tính từ dữ liệu hiện tại |

Giá trị chọn sẵn trong thẻ Lịch trình là `Cân bằng`.

Tại bước Xét nghiệm máu đang hoạt động, bệnh nhân có thể:

- Chọn `Xem hành trình xét nghiệm` để mở màn hình Chỉ định mới.
- Chọn `Xem đường đi` để mở Bản đồ bệnh viện.

Khối `Chỉ đường bước tiếp theo` hiển thị Lấy máu 01, tầng 1 khu A, cách khoảng 60 m, nên đến trước 10:20, hướng dẫn bằng chữ, nút `Xem bản đồ đầy đủ` và `Hỗ trợ xe lăn`.

##### E. Hỗ trợ

- Nút `Gọi nhân viên hỗ trợ`.
- Sơ đồ bệnh viện.
- Hướng dẫn quy trình.
- Đường dây 1900 1234.
- Hỗ trợ người thân thao tác thay.

#### Hạn chế hiện tại của Trang chủ

- Đổi ba lựa chọn trong thẻ Lịch trình chỉ làm thay đổi nhãn và tổng thời gian minh họa; sáu mốc bên dưới chưa được tính lại.
- Các nút Thông báo, Hồ sơ, Xem kết quả chi tiết, Hỗ trợ xe lăn và phần lớn mục Hỗ trợ chưa có hành động tiếp theo.

### 5.2. Bản đồ bệnh viện

**Tên thành phần:** `MapScreen.tsx`.

Màn hình hiển thị:

- Điểm đến Lấy máu 01, tầng 1 khu A.
- Ba thẻ tầng: Tầng 1, Tầng 2 và Tầng 3.
- Nút bật hoặc tắt tuyến đi.
- Chú giải điểm đến, tuyến đi và thang máy.
- Khoảng cách khoảng 60 m và trạng thái `Đang mở`.
- Thông tin có thang máy và lối xe lăn.
- Ba bước hướng dẫn bằng chữ.
- Nút `Tôi đã đến nơi` và `Không tìm thấy phòng`.

Bản đồ đang là hình minh họa tĩnh, chưa định vị vị trí thật và hai nút cuối chưa chuyển trạng thái.

### 5.3. Chỉ định mới — Bước 1/4

**Tên thành phần:** `NewPrescriptionScreen.tsx`.

Màn hình hiển thị:

- BS. Trần Văn Hùng, Khoa Tim mạch, Phòng 205.
- Bệnh nhân Nguyễn Thị Mai, lượt khám TM-2026-00847.
- Thời điểm ký chỉ định: 10:00.
- Ba dịch vụ và điều kiện chuẩn bị tương ứng.
- Cảnh báo phải nhịn ăn ít nhất 4 giờ trước khi lấy máu và trong suốt hành trình siêu âm.

Trong khoảng hai giây đầu, giao diện hiển thị `Hệ thống đang kiểm tra điều kiện`. Sau đó hiển thị `Đã tìm thấy 3 phương án`.

**Hành động chính:** `Chọn điều tôi ưu tiên`.

**Hành động phụ:** `Nhờ nhân viên hỗ trợ`.

Hạn chế hiện tại: nút Nhờ nhân viên hỗ trợ đang chuyển thẳng sang màn hình Chọn điều ưu tiên, chưa mở màn hình Hỗ trợ.

### 5.4. Chọn điều ưu tiên — Bước 2/4

**Tên thành phần:** `PriorityScreen.tsx`.

Đây là nhóm ba chiến lược duy nhất dùng để tạo và tính lại lộ trình.

| Lựa chọn | Mô tả trên giao diện |
|---|---|
| Cân bằng | Cân bằng thời gian chờ, di chuyển và thời điểm trả kết quả |
| Ưu tiên thời gian vào khám | Ưu tiên được tiếp nhận và hoàn thành các dịch vụ sớm; có thể chờ bác sĩ lâu hơn |
| Ưu tiên kết quả đến tay bác sĩ | Sắp xếp để các kết quả bắt buộc đến tay bác sĩ trong thời gian sớm nhất |

`Cân bằng` được chọn sẵn.

**Hành động chính:** `Tạo phương án`.

Khi người bệnh tiếp tục, frontend gửi chiến lược đã chọn để backend tính lại các phương án từ trạng thái phòng và hàng chờ mới nhất.

### 5.5. Chọn lộ trình — Bước 3/4

**Tên thành phần:** `RouteChoiceScreen.tsx`.

Màn hình luôn hiển thị ba phương án:

| Phương án | Thứ tự phòng | Hoàn tất dự kiến | Quãng đường | Đổi tầng |
|---|---|---:|---:|---:|
| KHUYẾN NGHỊ | Lấy máu 01 → X-quang 03 → Siêu âm 05 | 65–85 phút | 260 m | 1 lần |
| ÍT ĐI BỘ | Lấy máu 02 → X-quang 01 → Siêu âm 02 | 75–95 phút | 110 m | 0 lần |
| ÍT ĐÔNG | Lấy máu 03 → X-quang 02 → Siêu âm 04 | 70–90 phút | 320 m | 1 lần |

Khoảng chờ minh họa:

| Phương án | Lấy máu | X-quang | Siêu âm |
|---|---:|---:|---:|
| Khuyến nghị | 5–10 phút | 10–20 phút | 15–25 phút |
| Ít đi bộ | 10–15 phút | 15–25 phút | 20–30 phút |
| Ít đông | 3–8 phút | 5–12 phút | 8–15 phút |

Mỗi thẻ có:

- Thời điểm cập nhật.
- Khoảng hoàn tất dự kiến.
- Thứ tự ba dịch vụ và bước quay lại bác sĩ.
- Quãng đường và số lần đổi tầng.
- Nút `Vì sao thứ tự này?`.
- Nút `Chọn lộ trình này`.
- Nút `Xem chi tiết và đổi phòng`.

### 5.6. Chi tiết lộ trình — Bước 4/4

**Tên thành phần:** `RouteDetailScreen.tsx`.

Dòng thời gian có bốn bước:

1. Xét nghiệm máu.
2. Chụp X-quang ngực.
3. Siêu âm bụng.
4. Quay lại Phòng khám Tim mạch 205.

Mỗi bước hiển thị phòng, tầng, khoảng chờ, thời gian thực hiện, thời gian có kết quả, quãng đường và lý do sắp xếp.

#### Quy tắc khóa và đổi phòng

- Xét nghiệm máu bị khóa vì phải làm trước để mẫu được xử lý trong lúc bệnh nhân thực hiện bước khác.
- X-quang có thể đổi sang X-quang 04 hoặc X-quang 05.
- Siêu âm có thể đổi sang Siêu âm 06.
- Bước quay lại bác sĩ không thể đổi.

Khi chọn `Đổi phòng này`, bảng trượt từ dưới lên hiển thị:

- Phòng tương đương.
- Khoảng chờ.
- Có thang máy hay không.
- So sánh thời điểm hoàn tất, quãng đường và số lần đổi tầng.
- Cảnh báo X-quang và siêu âm sẽ được tính lại.
- Nút `Dùng thay đổi này` và `Giữ nguyên lộ trình`.

Hạn chế hiện tại: sau khi áp dụng thay đổi, tên phòng trên màn hình Chi tiết được đổi nhưng dữ liệu lộ trình gốc chưa được cập nhật khi chuyển sang màn hình Xác nhận.

### 5.7. Xác nhận và giữ chỗ — Bước 4/4

**Tên thành phần:** `ConfirmScreen.tsx`.

Màn hình hiển thị:

- Đồng hồ giữ chỗ 2 phút.
- Nhãn phương án đã chọn.
- Khoảng hoàn tất dự kiến.
- Quãng đường và số lần đổi tầng.
- Ba phòng và bước quay lại BS. Trần Văn Hùng tại Phòng 205.
- Thông báo lịch chờ cũ chưa bị giải phóng.

**Hành động chính:** `Xác nhận lộ trình`.

**Hành động phụ:** `Chọn phương án khác`.

Khi xác nhận:

1. Nút chuyển sang `Đang xác nhận` trong khoảng 1,8 giây.
2. Lớp phủ hiển thị `Đã xác nhận lộ trình`.
3. Sau khoảng một giây, ứng dụng chuyển sang Hành trình hôm nay.

Khi hết thời gian, nút chính hiển thị `Chỗ đã hết hạn — vui lòng chọn lại`.

Khi còn không quá 30 giây, giao diện hiện `Tôi cần thêm thời gian`, nhưng nút này hiện chưa gia hạn đồng hồ.

### 5.8. Hành trình hôm nay

**Tên thành phần:** `TodayJourneyScreen.tsx`.

Đây là màn hình chính sau khi xác nhận.

Màn hình hiển thị:

- Tiến độ từ `0/4` đến `4/4` theo dữ liệu hành trình.
- Thời điểm cập nhật gần nhất.
- Việc cần làm ngay, tên phòng, tầng và thời điểm nên có mặt.
- Nút `Xem chỉ đường`.
- Dòng thời gian gồm lấy máu, X-quang, siêu âm và quay lại bác sĩ.
- Ghi chú mẫu đang xử lý, kết quả sẵn sàng hoặc tiếp tục nhịn ăn.
- Cảnh báo máy X-quang tạm dừng và nút xem đề xuất thay đổi.
- Nút `Tôi cần hỗ trợ`.

Giao diện có nút `Mô phỏng: Hoàn tất bước...` để trình diễn việc chuyển bước. Nút này là công cụ trình diễn, không phải chức năng dành cho hệ thống thật.

### 5.9. Toàn bộ hành trình

**Tên thành phần:** `JourneyOverviewScreen.tsx`.

Màn hình xuất hiện khi chọn mục Hành trình ở thanh điều hướng dưới.

- Thanh tiến độ bốn bước.
- Tổng thời gian và quãng đường của lộ trình.
- Trạng thái `Hoàn tất`, `Hiện tại` hoặc chưa thực hiện.
- Khoảng chờ và thời gian kết quả của từng dịch vụ.
- Bước cuối là quay lại Phòng khám Tim mạch 205 khi đủ ba kết quả.

### 5.10. Chỉ đường

**Tên thành phần:** `DirectionsScreen.tsx`.

Màn hình hiển thị:

- Tên điểm đến, tầng và khoảng cách.
- Sơ đồ đường đi tĩnh.
- Điểm `Bạn đang ở đây` và điểm đến.
- Thông tin có thang máy và lối xe lăn.
- Bốn bước hướng dẫn bằng chữ.
- Gợi ý quét mã QR tại biển phòng.
- Điểm hỗ trợ gần nhất.

**Hành động chính:** `Tôi đã đến`.

**Hành động phụ:** `Không tìm thấy phòng`.

Chọn Tôi đã đến chuyển sang màn hình Đang chờ. Nút Không tìm thấy phòng hiện chỉ đổi trạng thái chọn ở thanh điều hướng; màn hình Hỗ trợ chưa thực sự mở từ màn hình Chỉ đường.

Hạn chế hiện tại: phần hướng dẫn chữ đang cố định theo đường đến X-quang tầng 2, chưa thay đổi hoàn toàn theo điểm đến được truyền vào.

### 5.11. Đang chờ

**Tên thành phần:** `WaitingScreen.tsx`.

Màn hình hiển thị:

- Dịch vụ và phòng hiện tại.
- Thời gian đã chờ.
- Số người phía trước.
- Khoảng thời gian dự kiến được gọi.
- Khoảng thời gian hoàn tất tất cả bước: 10:45–11:05.
- Thời điểm cập nhật 12 giây trước.
- Trạng thái phòng `Đang hoạt động`.
- Hướng dẫn được phép rời khu chờ hay phải ở lại.
- Bước tiếp theo.

**Hành động chính:** `Xem bước tiếp theo`.

**Hành động phụ:** `Tôi cần hỗ trợ`.

### 5.12. Thông báo

**Tên thành phần:** `NotificationsScreen.tsx`.

Dữ liệu minh họa gồm bốn thông báo:

1. Máy X-quang tạm dừng; đề nghị chuyển phòng để sớm hơn 18–25 phút.
2. Gần đến lượt; còn khoảng 5–8 phút.
3. Đã lấy máu thành công; kết quả dự kiến 10:45–11:00.
4. Lộ trình đã được xác nhận.

Hai thông báo đầu được đánh dấu chưa đọc.

### 5.13. Hỗ trợ trong hành trình

**Tên thành phần:** `SupportScreen.tsx`.

Màn hình hiển thị:

- Nút `Gọi nhân viên hỗ trợ` và cam kết minh họa 3–5 phút.
- Ba nhu cầu: Hỗ trợ xe lăn, Lối đi có thang máy, Hỗ trợ thị giác.
- Ba điểm hỗ trợ gần nhất cùng khoảng cách và trạng thái mở cửa.
- Gọi điện 1900 1234.
- Nhắn tin SMS bằng mã lượt khám đến 8088.

Hạn chế hiện tại: các lựa chọn mới chỉ hiển thị, chưa gọi điện, gửi SMS, đăng ký nhu cầu hoặc tạo yêu cầu hỗ trợ thật.

### 5.14. Đề nghị đổi lộ trình

**Tên thành phần:** `RouteChangeProposal.tsx`.

Lớp phủ xuất hiện khi bệnh nhân mở cảnh báo máy X-quang tạm dừng.

Nội dung:

- Lý do: bảo trì khẩn cấp.
- Trạng thái: Điều phối viên đã phê duyệt.
- Phòng cũ X-quang 03 và phòng mới X-quang 04.
- Khu cũ A và khu mới B, cùng tầng 2.
- Thời gian cũ 11:05–11:20 và thời gian mới 10:47–11:02.
- Lợi ích dự kiến sớm hơn 18–25 phút.
- Chỗ cũ vẫn được giữ trong lúc bệnh nhân quyết định.

Ba hành động:

- `Đồng ý đổi phòng`.
- `Giữ lộ trình hiện tại`.
- `Nhờ hỗ trợ`.

Hạn chế hiện tại: Đồng ý và Từ chối đều chỉ đóng lớp phủ; dữ liệu lộ trình chưa thay đổi.

### 5.15. Hoàn tất xét nghiệm

**Tên thành phần:** `CompletionScreen.tsx`.

Màn hình hiển thị:

- Ba dịch vụ đã hoàn tất và thời điểm có kết quả.
- Thông báo tất cả kết quả đã sẵn sàng.
- Điểm đến Phòng khám Tim mạch 205.
- Bác sĩ có thể tiếp nhận từ 11:30 đến 12:00.
- Xác nhận bác sĩ đã nhận kết quả.
- Nút `Chỉ đường quay lại phòng khám`.

Hạn chế hiện tại: nút mô phỏng chuyển bước bị ẩn tại bước cuối, vì vậy luồng trình diễn thông thường chưa tự chuyển đến màn hình Hoàn tất.

---

## 6. Một bộ chiến lược thống nhất

Màn hình tạo phương án và thẻ Lịch trình cùng sử dụng ba giá trị `balanced`, `finish_early` và `leave_fast`. Tiêu chí kỹ thuật `route_priority` được giữ ở giá trị trung lập `system` và không hiển thị cho bệnh nhân.

---

## 7. Trạng thái và chuyển màn hình thực tế

```text
dashboard
├─ mapView
└─ newPrescription
   └─ choosePriority
      └─ chooseRoute
         ├─ routeDetail
         │  └─ confirmReserve
         └─ confirmReserve
            └─ todayJourney
               ├─ directions
               │  └─ waiting
               │     └─ todayJourney
               ├─ notifications
               ├─ support
               ├─ journey
               └─ complete
```

Tên tiếng Anh trong sơ đồ là tên trạng thái trong mã nguồn; phần giải thích tiếng Việt tương ứng đã được mô tả ở mục 5.

---

## 8. Phản hồi của các thao tác chính

| Thao tác | Phản hồi hiện có | Kết quả chuyển màn hình |
|---|---|---|
| Xem chỉ định | Mở danh sách ba chỉ định | Chuyển thẻ Hôm nay → Chỉ định |
| Xem lịch trình | Mở sáu mốc trong ngày | Chuyển thẻ Chỉ định → Lịch trình |
| Xem hành trình xét nghiệm | Mở lại thông tin bác sĩ và chỉ định | Lịch trình → Chỉ định mới |
| Chọn điều tôi ưu tiên | Chờ kiểm tra xong mới cho bấm | Chỉ định mới → Chọn điều ưu tiên |
| Tạo phương án | Lưu lựa chọn ưu tiên | Chọn ưu tiên → Chọn lộ trình |
| Chọn lộ trình này | Lưu phương án | Chọn lộ trình → Xác nhận |
| Xem chi tiết và đổi phòng | Mở dòng thời gian bốn bước | Chọn lộ trình → Chi tiết |
| Xác nhận lộ trình | Hiện đang xử lý rồi báo thành công | Xác nhận → Hành trình hôm nay |
| Xem chỉ đường | Hiện sơ đồ và hướng dẫn chữ | Hành trình → Chỉ đường |
| Tôi đã đến | Xác nhận đến theo mô phỏng | Chỉ đường → Đang chờ |
| Tôi cần hỗ trợ | Chuyển sang mục Hỗ trợ | Hành trình hoặc Đang chờ → Hỗ trợ |
| Xem đề xuất thay đổi | Mở lớp phủ so sánh cũ và mới | Giữ nguyên màn hình nền |

---

## 9. Khoảng cách giữa giao diện nguyên mẫu và hệ thống dùng thật

Các mục dưới đây không phải lỗi tài liệu; đây là chức năng giao diện đang hiển thị nhưng mã nguồn chưa xử lý đầy đủ.

| Chức năng | Hiện trạng | Cần bổ sung trước khi dùng thật |
|---|---|---|
| Chọn ưu tiên | Chỉ đổi nhãn hoặc tổng thời gian minh họa | Tính lại và sắp xếp lộ trình theo tiêu chí |
| Đổi phòng | Chỉ đổi tên phòng ở màn hình Chi tiết | Lưu phòng mới, tính lại các bước và truyền sang Xác nhận |
| Đồng ý đổi lộ trình | Chỉ đóng lớp phủ | Cập nhật phòng, hàng chờ, thời gian và thông báo thành công |
| Cập nhật hỗ trợ | Nút chưa hoạt động | Lưu xe lăn, thang máy, thị giác và người hỗ trợ |
| Nhờ hỗ trợ ở Bước 1 | Chuyển nhầm sang Chọn ưu tiên | Mở Hỗ trợ hoặc tạo yêu cầu cho nhân viên |
| Gia hạn giữ chỗ | Chỉ hiển thị nút | Gửi yêu cầu gia hạn và phản hồi thành công hoặc thất bại |
| Bản đồ | Dữ liệu và hướng dẫn tĩnh | Dùng đúng vị trí, tầng và điểm đến hiện tại |
| Không tìm thấy phòng | Chưa mở được màn hình Hỗ trợ từ Chỉ đường | Chuyển đúng màn hình và gửi kèm điểm đến hiện tại |
| Xác nhận đến nơi | Chưa kiểm tra vị trí hoặc mã phòng | Đối chiếu mã QR, vị trí hoặc xác nhận của khoa |
| Hoàn tất dịch vụ | Dùng nút mô phỏng | Nhận trạng thái từ hệ thống xét nghiệm, chẩn đoán hình ảnh hoặc nhân viên |
| Màn hình Hoàn tất | Chưa đến được bằng luồng mô phỏng bình thường | Thêm sự kiện hoàn tất bước cuối và chuyển màn hình |
| Gọi và nhắn hỗ trợ | Chưa gửi yêu cầu thật | Tích hợp điện thoại, SMS hoặc hàng đợi hỗ trợ |

---

## 10. Yêu cầu dữ liệu khi triển khai thật

### Dữ liệu đầu vào

- Mã bệnh nhân và mã lượt khám.
- Chỉ định đã được bác sĩ ký.
- Điều kiện chuẩn bị và thứ tự bắt buộc.
- Danh sách phòng tương đương đã được bệnh viện phê duyệt.
- Hàng chờ, thời gian thực hiện và thời gian trả kết quả.
- Trạng thái thiết bị và nhân sự.
- Vị trí hiện tại hoặc điểm bắt đầu đã xác nhận.
- Nhu cầu xe lăn, thang máy, thị giác hoặc người hỗ trợ.
- Khả năng bác sĩ tiếp nhận lại sau khi có kết quả.

### Dữ liệu đầu ra

- Tiêu chí ưu tiên đã chọn.
- Lộ trình và phòng đã xác nhận.
- Mã giữ chỗ và thời gian hết hạn.
- Trạng thái di chuyển, đã đến, đang chờ và đã hoàn tất.
- Phòng thay thế bệnh nhân đồng ý hoặc từ chối.
- Thời gian thực tế của từng bước.
- Thông báo đã gửi cho bệnh nhân.

---

## 11. Điều kiện nghiệm thu theo giao diện hiện tại

- Ứng dụng mở tại Trang chủ trên khung rộng tối đa 430 px.
- Trang chủ có đủ năm thẻ Hôm nay, Chỉ định, Kết quả, Lịch trình và Hỗ trợ.
- Bệnh nhân đi được từ chỉ định mới qua bốn bước tạo lộ trình.
- Màn hình Chọn điều ưu tiên có đúng ba lựa chọn và mặc định Cân bằng.
- Màn hình Chọn lộ trình có đúng ba phương án Khuyến nghị, Ít đi bộ và Ít đông.
- Mỗi phương án hiển thị khoảng hoàn tất, từng phòng, khoảng chờ, quãng đường và số lần đổi tầng.
- Bệnh nhân xem được lý do sắp xếp và danh sách phòng thay thế.
- Đồng hồ giữ chỗ bắt đầu từ hai phút và khóa xác nhận khi hết hạn.
- Sau khi xác nhận, thanh điều hướng dưới có bốn mục.
- Chỉ đường có cả sơ đồ và hướng dẫn bằng chữ.
- Đang chờ có khoảng gọi dự kiến, số người trước và trạng thái được rời khu chờ.
- Cảnh báo sự cố hiển thị so sánh phòng cũ, phòng mới và lợi ích thời gian.
- Các chức năng chưa xử lý thật phải được đánh dấu rõ trong kế hoạch phát triển, không được trình bày như đã hoàn thiện.

---

## 12. Kết luận đối chiếu

Ứng dụng dùng thống nhất ba chế độ Cân bằng, Ưu tiên thời gian vào khám và Ưu tiên kết quả đến tay bác sĩ. Các màn hình Trang chủ, Bản đồ, Thông báo và Hỗ trợ không tạo thêm tiêu chí sắp lịch trình khác.

Phiên bản tài liệu này bám theo đúng màn hình và hành vi đang có. Điểm cần xử lý đầu tiên trước khi phát triển tiếp là thống nhất hai nhóm ưu tiên và nối các nút mô phỏng với dữ liệu điều phối thật.
