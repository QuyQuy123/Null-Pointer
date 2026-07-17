# ỨNG DỤNG 3 — TRUNG TÂM ĐIỀU PHỐI

> Tài liệu này dùng hệ thiết kế, quy tắc an toàn và [bảng giải thích thuật ngữ chung](ui.md#4-thuật-ngữ-dùng-chung) trong `ui.md`.

## 1. Mục tiêu

Trung tâm điều phối là bảng điều hành dành cho nhân viên vận hành bệnh viện. Công việc chính:

```text
Phát hiện bất thường
→ Hiểu nguyên nhân
→ Xem phương án điều phối
→ Kiểm tra an toàn
→ Phê duyệt
→ Theo dõi kết quả
```

Không gọi người sử dụng chung chung là “quản trị viên”. Trong bản thử nghiệm, vai trò chính là **điều phối viên bệnh viện**, người theo dõi tải và xử lý ngoại lệ nhưng không thay đổi quyết định chuyên môn.

---

## 2. Thiết bị và mật độ thông tin

- Ưu tiên máy tính để bàn rộng từ 1280 đến 1440 px.
- Máy tính bảng chỉ dùng để theo dõi và xử lý cảnh báo đơn giản.
- Điện thoại chỉ hiển thị cảnh báo khẩn; không cần đầy đủ chức năng trong bản 72 giờ.
- Giao diện có mật độ dữ liệu cao nhưng phải bình tĩnh, không giống bảng chứng khoán.
- Các vùng tự cập nhật có nút tạm dừng.

---

## 3. Nguyên tắc quyền hạn

### 3.1. Điều phối viên được phép

- Xem trạng thái khoa, phòng và thiết bị.
- Xem bệnh nhân có nguy cơ trễ.
- Phê duyệt chuyển giữa các phòng đã được xác nhận tương đương.
- Từ chối đề xuất và ghi lý do.
- Tạm dừng điều phối tự động trong phạm vi được cấp.
- Gửi thông báo vận hành cho bệnh nhân.

### 3.2. Điều phối viên không được phép

- Tạo hoặc hủy chỉ định.
- Thay đổi mức ưu tiên y tế.
- Xác định chống chỉ định.
- Xem nội dung y khoa không cần cho điều phối.
- Xóa nhật ký quyết định.

### 3.3. Quy tắc phê duyệt bản thử nghiệm

- Hệ thống tự cập nhật thời gian dự kiến.
- Mọi thay đổi phòng hoặc lộ trình đều cần điều phối viên phê duyệt.
- Phiên bản triển khai sau mới cân nhắc tự động hóa hành động rủi ro thấp đã được bệnh viện phê duyệt trước.

---

## 4. Nguồn dữ liệu và trạng thái thiết bị

Khi triển khai thật, trạng thái thiết bị chỉ được đọc từ hệ thống có thẩm quyền. Điều phối viên không tự đổi trạng thái máy thật từ bảng điều hành.

Trong bản trình diễn có bảng riêng:

> **Điều khiển kịch bản mô phỏng — không phải dữ liệu thật**

Bảng này cho phép tạo sự kiện máy hỏng hoặc ca cấp cứu để chứng minh phản ứng của hệ thống.

---

## 5. Cấu trúc điều hướng

Thanh bên trái gồm sáu mục:

| Mục | Chức năng |
|---|---|
| **Tổng quan** | Xem toàn cảnh tải, cảnh báo và việc cần xử lý |
| **Khu vực và thiết bị** | Xem chi tiết phòng khám, xét nghiệm và nguồn lực |
| **Điều phối** | Phê duyệt, chỉnh hoặc từ chối đề xuất |
| **Hàng chờ** | Theo dõi bệnh nhân đang chờ và người có nguy cơ trễ |
| **Sự cố** | Theo dõi máy hỏng, bác sĩ đổi lịch và mất kết nối |
| **Nhật ký** | Xem quyết định tự động và can thiệp thủ công |

Báo cáo và cấu hình nâng cao chưa cần là mục chính trong bản 72 giờ.

---

## 6. Màn hình Tổng quan

### 6.1. Bố cục

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ NHỊP VIỆN   09:42:18   Cập nhật 8 giây trước   Chế độ: Mô phỏng          │
├─────────────┬─────────────────────────────────────────┬───────────────────┤
│ Tổng quan   │ BẢN ĐỒ DÒNG BỆNH NHÂN                   │ CẢNH BÁO          │
│ Khu vực     │                                         │                   │
│ Điều phối   │ Khám → Lấy máu → X-quang → Tái khám    │ 1 nghiêm trọng    │
│ Hàng chờ    │  12       18          27          9     │ 2 cần xử lý       │
│ Sự cố       │ Bình thường Gần tải   Quá tải    Tốt    │                   │
│ Nhật ký     ├─────────────────────────────────────────┤                   │
│             │ Chờ hiện tại │ P50 │ P90 │ Khu quá tải │                   │
│             ├───────────────────────────┬─────────────┤                   │
│             │ Tải thực tế và dự báo     │ Đề xuất mới │                   │
│             │ trong 60 phút             │             │                   │
│             ├───────────────────────────┴─────────────┤                   │
│             │ Danh sách khu vực theo mức cần xử lý                        │
└─────────────┴─────────────────────────────────────────┴───────────────────┘
```

### 6.2. Dải trạng thái đầu trang

- Giờ hệ thống.
- Thời điểm dữ liệu mới nhất.
- Trạng thái kết nối.
- Phạm vi đang xem.
- Chế độ thật hoặc mô phỏng.
- Số cảnh báo chưa xử lý.

Không ghi chung chung “thời gian thực”. Phải ghi cụ thể “Cập nhật 8 giây trước”.

### 6.3. Bản đồ dòng bệnh nhân

Đây là thành phần nhận diện chính, thay cho một tập hợp thẻ số liệu chung chung.

```text
Phòng khám → Lấy máu → Xét nghiệm → X-quang → Tái khám
```

Mỗi nút hiển thị:

- Số bệnh nhân đang chờ.
- Tổng số phút công việc còn tồn.
- Năng lực đang hoạt động.
- Thời gian chờ trung vị.
- Xu hướng 30 phút tới.
- Trạng thái bằng chữ, biểu tượng và màu.

Đường nối thể hiện số bệnh nhân đang được chuyển. Khi X-quang quá tải, người dùng nhìn thấy khoa nào vẫn đang tiếp tục gửi người tới.

### 6.4. Chỉ số chính

- Bệnh nhân đang chờ.
- Thời gian chờ trung vị.
- P90 thời gian chờ.
- Số khu vực quá tải.
- Số bệnh nhân có nguy cơ trễ hành trình.
- Số đề xuất chờ phê duyệt.

Không chỉ dùng thời gian trung bình vì chỉ số này có thể che khuất nhóm chờ quá lâu.

---

## 7. Hệ thống cảnh báo

### 7.1. Ba mức

| Mức | Ví dụ | Cách xử lý giao diện |
|---|---|---|
| **Nghiêm trọng** | Thiết bị hỏng, sai danh tính, dữ liệu mâu thuẫn | Đặt đầu danh sách và yêu cầu xử lý ngay |
| **Cần xử lý** | Khu vực sắp quá tải, nhiều bệnh nhân có nguy cơ trễ | Ghi rõ thời hạn cần xem |
| **Theo dõi** | Tải tăng nhưng chưa vượt ngưỡng | Không làm gián đoạn công việc hiện tại |

Mỗi cảnh báo gồm:

- Điều gì đã xảy ra.
- Khu vực bị ảnh hưởng.
- Số bệnh nhân liên quan.
- Thời điểm phát hiện.
- Độ mới dữ liệu.
- Hậu quả nếu không xử lý.
- Hành động đề xuất.
- Thời hạn đề xuất còn hiệu lực.

Ví dụ:

> **X-quang 02 ngừng hoạt động lúc 09:41**
> 8 bệnh nhân bị ảnh hưởng, 3 người có nguy cơ trễ tái khám.
> Dữ liệu cập nhật 12 giây trước. Hệ thống đã tạo 2 phương án.

Chỉ sự cố nghiêm trọng mới dùng cửa sổ làm gián đoạn. Cảnh báo thường nằm trong bảng bên phải.

---

## 8. Màn hình Chi tiết khu vực

Ví dụ khu X-quang.

### 8.1. Tóm tắt

- Trạng thái: quá tải.
- 27 bệnh nhân đang chờ.
- Thời gian chờ trung vị: 31 phút.
- P90: 52 phút.
- Hai trên ba máy đang hoạt động.
- Dữ liệu cập nhật 10 giây trước.

### 8.2. Danh sách nguồn lực

| Nguồn lực | Trạng thái | Ca hiện tại | Hàng chờ | Cập nhật |
|---|---|---:|---:|---|
| X-quang 01 | Hoạt động | 1 | 9 | 6 giây trước |
| X-quang 02 | Lỗi | 0 | 8 bị ảnh hưởng | 15 giây trước |
| X-quang 03 | Hoạt động | 1 | 7 | 7 giây trước |

### 8.3. Dự báo tải

Biểu đồ đường gồm:

- Đường liền: tải đã xảy ra.
- Đường nét đứt: tải dự báo 60 phút tới.
- Vùng mờ: khoảng không chắc chắn.
- Đường ngang: ngưỡng quá tải.

Bên cạnh biểu đồ phải có bảng số liệu thay thế.

### 8.4. Hàng chờ khu vực

Các cột:

- Mã bệnh nhân đã che bớt.
- Mức ưu tiên từ nguồn chính thức.
- Thời gian đã chờ.
- Khoảng thời gian được phục vụ.
- Thời gian còn có thể chậm.
- Bước tiếp theo.
- Cờ cảnh báo.
- Nút xem hành trình.

---

## 9. Màn hình Điều phối

### 9.1. Thẻ đề xuất

Mỗi đề xuất phải trả lời:

1. Hệ thống muốn thay đổi điều gì?
2. Vì sao cần thay đổi?
3. Có bao nhiêu bệnh nhân bị ảnh hưởng?
4. Dự kiến tiết kiệm bao nhiêu phút?
5. Quy tắc an toàn nào đã được kiểm tra?
6. Dữ liệu mới đến đâu?
7. Đề xuất còn hiệu lực bao lâu?
8. Có thể quay lại kế hoạch cũ không?

Ví dụ:

> Chuyển 3 bệnh nhân từ X-quang 02 sang X-quang 03.
> Dự kiến giảm tổng thời gian chờ 64 phút.
> Không thay đổi mức ưu tiên y tế.
> X-quang 03 đã giữ chỗ trong 90 giây.
> Dữ liệu cập nhật 8 giây trước.

### 9.2. Luồng phê duyệt

```text
Mở đề xuất
→ Xem bệnh nhân bị ảnh hưởng
→ Xem kiểm tra an toàn
→ Giữ chỗ nơi mới
→ Phê duyệt hoặc từ chối
→ Cập nhật hành trình
→ Gửi thông báo
→ Ghi nhật ký
```

Ba hành động:

- “Phê duyệt và thông báo”.
- “Chỉnh phương án”.
- “Từ chối”.

Khi chỉnh hoặc từ chối, điều phối viên chọn một lý do có sẵn và có thể thêm ghi chú.

### 9.3. Chống xử lý trùng

Mỗi đề xuất có số phiên bản. Nếu người khác đã xử lý:

> Đề xuất đã được Nguyễn An phê duyệt lúc 09:44. Dữ liệu trên màn hình của bạn không còn mới. Hãy tải lại trạng thái.

Không áp dụng đề xuất lần thứ hai.

---

## 10. Màn hình Sự cố

Nội dung:

- Sự cố đang mở.
- Nguồn phát hiện.
- Thời điểm bắt đầu.
- Khu vực và thiết bị.
- Số bệnh nhân bị ảnh hưởng.
- Phương án tạm thời.
- Trạng thái xử lý.
- Người phụ trách.

Bảng điều khiển mô phỏng có các nút:

- “X-quang 02 bị lỗi”.
- “Một ca cấp cứu xuất hiện”.
- “Bác sĩ phòng khám 02 nghỉ”.
- “Phục hồi trạng thái ban đầu”.

Sau khi kích hoạt:

1. Bản đồ dòng bệnh nhân đổi trạng thái.
2. Cảnh báo xuất hiện.
3. Danh sách bệnh nhân bị ảnh hưởng được tạo.
4. Hệ thống tạo phương án.
5. Điều phối viên phê duyệt.
6. Hàng chờ và thời gian được cập nhật.
7. Nhật ký ghi lại toàn bộ quá trình.

---

## 11. Màn hình Hàng chờ

### 11.1. Bộ lọc

- Khu vực.
- Trạng thái.
- Mức ưu tiên.
- Đã chờ quá ngưỡng.
- Có nguy cơ trễ.
- Có sự cố ảnh hưởng.
- Đang chờ phê duyệt.

### 11.2. Chi tiết bệnh nhân

Mở bằng bảng trượt bên phải để không làm mất bộ lọc.

Hiển thị:

- Mã bệnh nhân.
- Bước hiện tại.
- Thời gian đã chờ.
- Khoảng dự kiến được phục vụ.
- Các bước đã xong và còn lại.
- Kết quả đang xử lý.
- Lần thay đổi gần nhất.
- Thông báo đã gửi.
- Đề xuất đang ảnh hưởng.

Không hiển thị chẩn đoán nếu điều phối viên không cần thông tin đó.

---

## 12. Nhật ký vận hành

Các cột:

- Thời gian.
- Người hoặc hệ thống thực hiện.
- Hành động.
- Trạng thái trước và sau.
- Lý do.
- Phiên bản dữ liệu.
- Số bệnh nhân bị ảnh hưởng.
- Kết quả thực tế.

Ví dụ:

```text
09:44:12
Điều phối viên Nguyễn An
Phê duyệt chuyển 3 bệnh nhân từ X-quang 02 sang X-quang 03
Lý do: X-quang 02 gặp lỗi
Dự kiến giảm: 64 phút
Thông báo thành công: 3/3
```

Không có chức năng xóa nhật ký trong bản thử nghiệm.

---

## 13. Biểu đồ

| Mục đích | Cách thể hiện |
|---|---|
| So sánh tải giữa các khoa | Biểu đồ thanh ngang, sắp xếp từ cao xuống thấp |
| Theo dõi tải theo thời gian | Biểu đồ đường |
| Hiển thị dự báo | Đường nét đứt và vùng không chắc chắn |
| Đánh dấu sự cố | Biểu đồ đường có ký hiệu và chú thích tại thời điểm bất thường |
| So sánh trước–sau | Hai nhóm cột đặt cạnh nhau |
| Mật độ theo giờ và khoa | Bản đồ nhiệt ở trang phân tích, không đặt làm trung tâm |

Không dùng biểu đồ tròn cho nhiều khoa. Mọi biểu đồ có:

- Chú giải rõ.
- Giá trị khi dùng bàn phím hoặc con trỏ.
- Tóm tắt bằng chữ.
- Bảng dữ liệu thay thế.
- Nút tạm dừng nếu dữ liệu tự cập nhật.

---

## 14. Phân quyền

| Hành động | Điều phối viên | Trưởng khoa | Quản lý vận hành | Chỉ xem |
|---|---:|---:|---:|---:|
| Xem tổng quan | Có | Có | Có | Có |
| Xem hàng chờ theo phạm vi | Có | Có | Có | Có |
| Phê duyệt chuyển phòng tương đương | Có | Có | Có | Không |
| Từ chối đề xuất | Có | Có | Có | Không |
| Tạm dừng điều phối | Theo phạm vi | Theo khoa | Toàn viện | Không |
| Thay đổi quy tắc nền | Không | Không | Có | Không |
| Thay đổi ưu tiên y tế | Không | Theo quy trình chuyên môn riêng | Không | Không |
| Xem nhật ký | Có | Có | Có | Có |

---

## 15. Trạng thái lỗi

| Lỗi | Cách xử lý |
|---|---|
| Mất kết nối | Giữ dữ liệu gần nhất, ghi rõ thời điểm và dừng đề xuất mới |
| Dữ liệu quá cũ | Đánh dấu “Không đủ tin cậy” |
| Hai nguồn mâu thuẫn | Dừng điều phối và yêu cầu xác minh |
| Tính toán quá thời gian | Giữ kế hoạch hiện tại và cho phép thử lại |
| Đề xuất hết hạn | Khóa nút phê duyệt và tính lại |
| Chỗ mới không còn | Không giải phóng chỗ cũ; tạo lại phương án |
| Người khác đã xử lý | Báo xung đột và tải trạng thái mới |
| Gửi thông báo thất bại | Đánh dấu cần liên hệ thủ công |
| Không có phương án an toàn | Ghi rõ nguyên nhân, không tạo phương án ép buộc |
| Không có dữ liệu | Hiển thị cách khắc phục, không để biểu đồ trống |

---

## 16. Khả năng tiếp cận

- Toàn bộ thao tác dùng được bằng bàn phím.
- Thứ tự chuyển tiêu điểm theo thứ tự hiển thị.
- Nút biểu tượng có nhãn chữ.
- Tương phản chữ tối thiểu 4,5:1.
- Không dùng màu làm tín hiệu duy nhất.
- Cảnh báo mới không tự cướp tiêu điểm.
- Vùng tự cập nhật có nút tạm dừng.
- Biểu đồ có bảng số liệu.
- Hỗ trợ giảm chuyển động.
- Vùng bấm tối thiểu 44 × 44 px.
- Chữ trong bảng không nhỏ hơn 14 px.
- Số liệu dùng chữ số có độ rộng cố định.

---

## 17. Phạm vi MVP

Năm màn hình cần xây:

1. Tổng quan vận hành.
2. Chi tiết khu X-quang.
3. Chi tiết đề xuất và phê duyệt.
4. Hàng chờ kèm chi tiết bệnh nhân.
5. Nhật ký vận hành.

Phần phải chạy trong demo:

- Dữ liệu giả lập tự cập nhật.
- X-quang 02 chuyển sang trạng thái lỗi.
- Cảnh báo được tạo.
- Bệnh nhân bị ảnh hưởng được xác định.
- Phương án điều phối xuất hiện.
- Điều phối viên phê duyệt.
- Hàng chờ và hành trình bệnh nhân thay đổi.
- Nhật ký ghi quyết định.

Chưa cần:

- Quản lý tài khoản đầy đủ.
- Trình cấu hình quy tắc phức tạp.
- Xuất báo cáo.
- Chế độ tối hoàn chỉnh.
- Chỉnh trạng thái thiết bị thật.
- Tích hợp dữ liệu bệnh viện thật.

Điều kiện nghiệm thu:

- Bản đồ dòng bệnh nhân phản ánh sự cố.
- Cảnh báo có nguyên nhân, tác động và hành động.
- Đề xuất cho biết quy tắc an toàn và độ mới dữ liệu.
- Hai người không thể phê duyệt cùng một phiên bản.
- Không giải phóng chỗ cũ nếu chỗ mới thất bại.
- Biểu đồ có dữ liệu thay thế.
- Nhật ký lưu đủ chuỗi phát hiện, phê duyệt, thông báo và kết quả.
