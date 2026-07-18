# YÊU CẦU CHỨC NĂNG — ỨNG DỤNG ĐIỀU PHỐI HÀNH TRÌNH BỆNH NHÂN

## 1. Mục đích

Tài liệu này chuyển giao diện trong `giaodien/` và mô tả tại `ui-benh-nhan.md` thành yêu cầu có thể phát triển, kiểm thử và nghiệm thu.

**Yêu cầu chức năng** là mô tả hệ thống phải làm được việc gì.
**Tiêu chí nghiệm thu** là điều kiện cụ thể để xác nhận chức năng đã hoạt động đúng.

## 2. Phạm vi

Luồng bắt đầu khi bác sĩ đã khám và ký chỉ định, kết thúc khi bệnh nhân hoàn tất các dịch vụ bắt buộc và được hướng dẫn quay lại bác sĩ.

Trong phạm vi:

- Xem chỉ định và điều kiện chuẩn bị.
- Chọn tiêu chí ưu tiên.
- Tạo và so sánh lộ trình.
- Đổi phòng tương đương.
- Giữ chỗ và xác nhận.
- Xem chỉ đường, hàng chờ và thời gian dự kiến.
- Theo dõi kết quả đã sẵn sàng hay chưa.
- Nhận đề nghị đổi lộ trình khi có sự cố.
- Gửi yêu cầu hỗ trợ.

Ngoài phạm vi:

- Chẩn đoán bệnh.
- Tạo hoặc sửa chỉ định.
- Thay đổi mức ưu tiên y tế.
- Hiển thị kết luận y khoa chưa được bác sĩ xác nhận.
- Tự cho phép bệnh nhân ra viện.

## 3. Tác nhân sử dụng

| Tác nhân | Vai trò |
|---|---|
| Bệnh nhân | Xem, lựa chọn, xác nhận và thực hiện hành trình |
| Người thân được ủy quyền | Hỗ trợ thao tác thay cho bệnh nhân |
| Nhân viên hỗ trợ | Tiếp nhận yêu cầu xe lăn, chỉ đường hoặc hỗ trợ trực tiếp |
| Điều phối viên | Phê duyệt đề nghị đổi lộ trình do sự cố |
| Bác sĩ | Ký chỉ định và tiếp nhận bệnh nhân khi đủ kết quả |
| Hệ thống bệnh viện | Cung cấp chỉ định, kết quả, phòng, thiết bị và hàng chờ |
| Dịch vụ AI | Tạo dự báo hoặc xếp hạng phương án; không tự thực thi thay đổi |

## 4. Dữ liệu minh họa từ giao diện

- Bệnh nhân: Nguyễn Thị Mai.
- Mã lượt khám: TM-2026-00847.
- Bác sĩ: BS. Trần Văn Hùng, Tim mạch, Phòng 205.
- Dịch vụ: Xét nghiệm máu, X-quang ngực và Siêu âm bụng.
- Điều kiện: Nhịn ăn ít nhất 4 giờ và tiếp tục nhịn ăn đến khi siêu âm hoàn tất.

Dữ liệu trên chỉ dùng cho bản trình diễn. Hệ thống thật phải đọc dữ liệu theo mã lượt khám.

## 5. Danh sách chức năng

### FR-HOME — Trang chủ và bối cảnh lượt khám

#### FR-HOME-001: Hiển thị bệnh nhân đang khám

Hệ thống phải hiển thị tên bệnh nhân, mã bệnh nhân, mã lượt khám, trạng thái và bác sĩ phụ trách.

Tiêu chí nghiệm thu:

- Dữ liệu thuộc đúng người đang đăng nhập hoặc hồ sơ được ủy quyền.
- Không lưu thông tin y tế vào nhật ký trình duyệt.
- Khi không tải được dữ liệu, giao diện hiển thị nguyên nhân và nút thử lại.

#### FR-HOME-002: Hiển thị năm nhóm nội dung

Trang chủ có Hôm nay, Chỉ định, Kết quả, Lịch trình và Hỗ trợ.

- Hôm nay hiển thị việc đang cần làm.
- Chỉ định hiển thị dịch vụ bắt buộc.
- Kết quả chỉ hiển thị trạng thái sẵn sàng.
- Lịch trình hiển thị dòng thời gian trong ngày.
- Hỗ trợ hiển thị các kênh trợ giúp.

#### FR-HOME-003: Đồng bộ trạng thái

Mỗi nhóm dữ liệu thời gian thực phải có thời điểm cập nhật gần nhất. Dữ liệu quá cũ phải được đánh dấu và không dùng để tạo lộ trình mới.

### FR-ORDER — Chỉ định mới

#### FR-ORDER-001: Đọc chỉ định đã ký

Hệ thống chỉ nhận chỉ định có trạng thái đã ký, còn hiệu lực và thuộc đúng lượt khám.

#### FR-ORDER-002: Hiển thị điều kiện chuẩn bị

Mỗi dịch vụ phải hiển thị:

- Tên và mã dịch vụ.
- Điều kiện nhịn ăn hoặc chuẩn bị khác.
- Bước có bắt buộc làm trước hay không.
- Thời điểm bác sĩ ký.

#### FR-ORDER-003: Kiểm tra trước khi tạo phương án

Hệ thống phải kiểm tra đủ dữ liệu, phòng phù hợp, trạng thái thiết bị và nhu cầu hỗ trợ. Khi dữ liệu mâu thuẫn, hệ thống dừng tạo phương án và chuyển sang hỗ trợ.

### FR-PREF — Lựa chọn ưu tiên

Giao diện hiện có hai nhóm, phải lưu bằng hai trường khác nhau để tránh hiểu nhầm.

#### FR-PREF-001: Chiến lược lịch trong ngày

Trường `schedule_strategy` có ba giá trị:

| Mã | Nhãn giao diện | Ý nghĩa |
|---|---|---|
| `balanced` | Cân bằng | Cân đối thời gian, quãng đường và độ ổn định |
| `finish_early` | Ưu tiên hoàn tất sớm | Lấy đủ kết quả và quay lại bác sĩ sớm |
| `leave_fast` | Ra khỏi viện nhanh nhất | Rút ngắn toàn lượt khám nhưng không tự cho phép ra viện |

#### FR-PREF-002: Tiêu chí tạo lộ trình

Trường `route_priority` có năm giá trị:

| Mã | Nhãn giao diện |
|---|---|
| `system` | Để hệ thống đề xuất |
| `fastest` | Hoàn tất sớm |
| `less_walk` | Ít đi bộ |
| `less_crowd` | Khu chờ ít đông |
| `accessible` | Hỗ trợ di chuyển |

`fastest` là giá trị mặc định theo giao diện hiện tại.

#### FR-PREF-003: Tính lại khi thay đổi

Khi bệnh nhân đổi ưu tiên, hệ thống phải tạo hoặc sắp xếp lại phương án. Không chỉ thay nhãn hiển thị.

### FR-ROUTE — Tạo và so sánh lộ trình

#### FR-ROUTE-001: Tạo phương án hợp lệ

Hệ thống tạo tối đa ba phương án từ các phòng đã được bệnh viện xác nhận tương đương.

#### FR-ROUTE-002: Nội dung một phương án

Mỗi phương án phải có:

- Nhãn Khuyến nghị, Ít đi bộ hoặc Ít đông.
- Khoảng hoàn tất dự kiến.
- Thứ tự phòng.
- Khoảng chờ từng bước.
- Quãng đường và số lần đổi tầng.
- Lý do đề xuất.
- Thời điểm dữ liệu được cập nhật.
- Thời hạn hiệu lực.

#### FR-ROUTE-003: Giải thích đề xuất

Nút Vì sao thứ tự này phải trả lời bằng câu ngắn, không dùng điểm kỹ thuật không giải thích được.

#### FR-ROUTE-004: Bảo vệ ràng buộc

Không phương án nào được vi phạm chỉ định, điều kiện chuẩn bị, mức ưu tiên, cách ly hoặc nhu cầu tiếp cận.

### FR-DETAIL — Chi tiết và đổi phòng

#### FR-DETAIL-001: Dòng thời gian bốn bước

Hiển thị xét nghiệm máu, X-quang, siêu âm và quay lại bác sĩ cùng phòng, tầng, chờ, thực hiện, kết quả và di chuyển.

#### FR-DETAIL-002: Bước bị khóa

Bước không được đổi phải có nhãn Khóa và lý do. Trong kịch bản minh họa, xét nghiệm máu được khóa để mẫu được xử lý trong lúc bệnh nhân làm bước khác.

#### FR-DETAIL-003: Phòng thay thế

Chỉ hiển thị phòng tương đương đang hoạt động và phù hợp nhu cầu bệnh nhân.

#### FR-DETAIL-004: Tính lại toàn tuyến

Sau khi chọn phòng khác, hệ thống phải tính lại tất cả bước bị ảnh hưởng và hiển thị so sánh trước–sau trước khi áp dụng.

### FR-HOLD — Giữ chỗ và xác nhận

#### FR-HOLD-001: Giữ chỗ tạm

Khi bệnh nhân chọn phương án, backend tạo mã giữ chỗ có thời gian hết hạn. Giao diện hiện đồng hồ đếm ngược hai phút.

#### FR-HOLD-002: Xác nhận an toàn

Xác nhận phải kiểm tra lại công suất và phiên bản dữ liệu. Một yêu cầu gửi lặp không được tạo nhiều hành trình.

#### FR-HOLD-003: Gia hạn

Nút Tôi cần thêm thời gian phải gửi yêu cầu gia hạn và trả về thời gian mới hoặc lý do từ chối.

#### FR-HOLD-004: Bảo toàn chỗ cũ

Không giải phóng chỗ hiện tại trước khi chỗ mới được xác nhận.

### FR-JOURNEY — Hành trình đang thực hiện

#### FR-JOURNEY-001: Việc cần làm ngay

Hiển thị bước hiện tại, phòng, tầng, khoảng cách và thời điểm nên có mặt.

#### FR-JOURNEY-002: Tiến độ

Hiển thị bốn trạng thái theo thứ tự và đánh dấu đã hoàn tất, hiện tại hoặc chưa làm.

#### FR-JOURNEY-003: Cập nhật từ hệ thống nghiệp vụ

Việc hoàn tất dịch vụ phải đến từ nhân viên hoặc hệ thống LIS/RIS/PACS, không dựa vào nút tự khai của bệnh nhân.

**LIS – hệ thống thông tin xét nghiệm** quản lý mẫu và kết quả xét nghiệm.
**RIS/PACS – hệ thống thông tin và lưu trữ ảnh chẩn đoán** quản lý X-quang, CT, MRI và hình ảnh liên quan.

#### FR-JOURNEY-004: Quay lại bác sĩ

Chỉ hướng dẫn quay lại khi đủ kết quả bắt buộc hoặc có chỉ dẫn chính thức của bệnh viện.

### FR-MAP — Chỉ đường

#### FR-MAP-001: Điểm đến động

Bản đồ và hướng dẫn chữ phải thay đổi theo đúng phòng, tầng và vị trí hiện tại.

#### FR-MAP-002: Tuyến tiếp cận

Khi bệnh nhân cần xe lăn hoặc tránh cầu thang, tuyến phải đi qua lối phù hợp và thang máy đang hoạt động.

#### FR-MAP-003: Xác nhận đã đến

Có thể dùng mã QR, vị trí hoặc xác nhận tại quầy. Xác nhận sai phòng không được đưa bệnh nhân vào hàng chờ.

### FR-WAIT — Theo dõi hàng chờ

#### FR-WAIT-001: Thông tin chờ

Hiển thị số người phía trước, khoảng được gọi, thời gian đã chờ, trạng thái phòng và thời điểm cập nhật.

#### FR-WAIT-002: Rời khu chờ

Giao diện phải nói rõ bệnh nhân có được rời khu chờ hay không và phải quay lại trước khi nào.

#### FR-WAIT-003: Cập nhật trực tiếp

Trạng thái chờ được cập nhật mà không bắt buộc tải lại toàn trang.

### FR-NOTIFY — Thông báo

Hệ thống hỗ trợ:

- Gần đến lượt.
- Đã lấy mẫu.
- Kết quả sẵn sàng.
- Lộ trình được xác nhận.
- Thiết bị tạm dừng.
- Đề nghị đổi phòng.

Mỗi thông báo có loại, nội dung, thời gian, trạng thái đã đọc và liên kết đến hành động phù hợp.

### FR-SUPPORT — Hỗ trợ

#### FR-SUPPORT-001: Tạo yêu cầu

Bệnh nhân có thể yêu cầu nhân viên, xe lăn, lối thang máy hoặc hỗ trợ thị giác.

#### FR-SUPPORT-002: Theo dõi yêu cầu

Sau khi gửi, giao diện hiển thị mã yêu cầu, trạng thái và thời gian phản hồi dự kiến.

#### FR-SUPPORT-003: Kênh thay thế

Hỗ trợ điện thoại và SMS cho người không dùng đầy đủ ứng dụng.

### FR-REROUTE — Đổi lộ trình khi có sự cố

#### FR-REROUTE-001: Tạo đề nghị

Khi phòng tạm dừng, hệ thống tìm phòng tương đương, giữ tạm chỗ mới và tính lại toàn hành trình.

#### FR-REROUTE-002: Nội dung so sánh

Hiển thị lý do, phòng cũ, phòng mới, thời gian cũ, thời gian mới, lợi ích, trạng thái phê duyệt và việc chỗ cũ còn được giữ hay không.

#### FR-REROUTE-003: Quyết định của bệnh nhân

Bệnh nhân có thể đồng ý, giữ lộ trình hiện tại hoặc nhờ hỗ trợ. Kết quả phải được lưu và phản hồi rõ ràng.

### FR-COMPLETE — Hoàn tất và quay lại bác sĩ

Màn hình hoàn tất hiển thị dịch vụ đã xong, trạng thái kết quả, phòng bác sĩ, khoảng tiếp nhận và nút chỉ đường quay lại.

### FR-SIM — Dữ liệu bệnh viện giả lập

#### FR-SIM-001: Nhập danh mục cận lâm sàng

Người vận hành có thể nhập mã, tên, nhóm dịch vụ, loại phòng phục vụ, thời gian thực hiện, TAT, điều kiện nhịn ăn, quy tắc ưu tiên, lưu ý và danh sách phòng hoặc tòa.

#### FR-SIM-002: Lưu và sửa dữ liệu

Dữ liệu phải được kiểm tra trước khi lưu vào SQLite, không mất khi khởi động lại backend và tăng phiên bản sau mỗi lần sửa.

#### FR-SIM-003: Ngừng sử dụng an toàn

Ngừng sử dụng không xóa bản ghi. Dịch vụ ngừng dùng vẫn xuất hiện ở trang quản trị nhưng không được đưa vào nguồn dữ liệu đang hoạt động.

#### FR-SIM-004: Mô phỏng hợp đồng API bệnh viện

Backend phải xuất danh mục đang hoạt động theo một hợp đồng có phiên bản và nguồn dữ liệu. Phần nghiệp vụ đọc qua cổng kho dữ liệu để bộ giả lập có thể được thay bằng adapter HIS, LIS hoặc RIS/PACS mà không đổi cấu trúc dữ liệu chung.

#### FR-SIM-005: Gửi chỉ định cho bệnh nhân giả lập

Người vận hành phải chọn bệnh nhân, lượt khám và một hoặc nhiều chỉ định còn hoạt động. Hệ thống chỉ gửi nguyên trạng các chỉ định đã chọn, không tự tạo hoặc thay đổi chỉ định của bác sĩ.

#### FR-SIM-006: Tìm phòng phù hợp từ chỉ định

Với mỗi chỉ định, hệ thống phải đối chiếu loại phòng phục vụ, danh sách phòng/tòa được cấu hình, trạng thái phòng, trạng thái thiết bị và hàng chờ. Phòng sai loại, ngoài danh sách hoặc tạm dừng không được xuất hiện trong phương án.

#### FR-SIM-007: Bệnh nhân nhận lộ trình

Sau khi điều phối thành công, bệnh nhân giả lập phải đọc được điểm đến đầu tiên và toàn bộ thứ tự phòng cần đến. Dữ liệu trên màn hình bệnh nhân phải cùng phiên bản với kết quả vừa gửi từ màn hình vận hành.

## 6. Yêu cầu phi chức năng

**Yêu cầu phi chức năng** mô tả chất lượng vận hành thay vì một nút hoặc màn hình cụ thể.

### NFR-SEC — Bảo mật

- Xác thực người dùng và kiểm tra quyền trên mọi API dữ liệu bệnh nhân.
- Mã hóa kết nối.
- Không để khóa bí mật trong mã nguồn.
- Nhật ký không chứa nội dung y tế không cần thiết.

### NFR-REL — Độ tin cậy

- Yêu cầu xác nhận lặp phải cho cùng một kết quả an toàn.
- Khi hệ thống AI không phản hồi, giữ kế hoạch hiện tại.
- Khi mất kết nối, ghi rõ dữ liệu gần nhất và không tự đổi tuyến.

### NFR-PERF — Hiệu năng

- Trang chính có phản hồi tải trong 2 giây ở mạng nội bộ bình thường.
- API đọc thông thường hướng tới thời gian phản hồi dưới 500 mili giây ở mốc 95 phần trăm.
- Tạo phương án phải có giới hạn thời gian và phương án dự phòng.

### NFR-A11Y — Khả năng tiếp cận

- Vùng bấm tối thiểu 44 × 44 px, ưu tiên 48 × 48 px.
- Dùng được bằng bàn phím.
- Không dùng màu làm dấu hiệu duy nhất.
- Bản đồ có hướng dẫn chữ.
- Cập nhật hàng chờ có thông báo phù hợp cho trình đọc màn hình.

### NFR-AUDIT — Nhật ký

Lưu ai hoặc hệ thống nào đã đề xuất, phê duyệt, xác nhận hoặc từ chối; dùng phiên bản thuật toán nào; dữ liệu cập nhật lúc nào; kết quả trước và sau ra sao.

## 7. Luồng nghiệm thu đầu-cuối

```text
Bác sĩ ký 3 chỉ định
→ Bệnh nhân xem điều kiện nhịn ăn
→ Chọn Hoàn tất sớm
→ Nhận 3 phương án
→ Xem lý do và đổi một phòng
→ Hệ thống tính lại toàn tuyến
→ Giữ chỗ 2 phút
→ Xác nhận
→ Xem chỉ đường
→ Xác nhận đã đến đúng phòng
→ Theo dõi hàng chờ
→ Máy X-quang tạm dừng
→ Bệnh nhân xem và đồng ý phòng thay thế
→ Hoàn tất các dịch vụ
→ Quay lại bác sĩ khi đủ kết quả
```

Luồng đạt khi không vi phạm chỉ định, không tạo chỗ trùng, không mất chỗ cũ trong lúc đổi và mọi quyết định đều có nhật ký.
