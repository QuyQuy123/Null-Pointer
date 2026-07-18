<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Null-Pointer** (3398 symbols, 5613 relationships, 79 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Null-Pointer/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Null-Pointer/clusters` | All functional areas |
| `gitnexus://repo/Null-Pointer/processes` | All execution flows |
| `gitnexus://repo/Null-Pointer/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

# QUY TẮC PHÁT TRIỂN BẮT BUỘC CỦA NHỊP VIỆN

Phần trên do GitNexus tự tạo. Không xóa hoặc sửa nội dung nằm giữa `gitnexus:start` và `gitnexus:end` bằng tay.

## 1. Phạm vi áp dụng

Quy tắc này áp dụng cho mọi AI, lập trình viên và công cụ tự động khi đọc hoặc sửa kho mã.

- Nội dung giao diện và tài liệu phải dùng tiếng Việt có dấu, mã UTF-8.
- Tên tệp, thư mục, hàm, lớp và biến trong mã nguồn dùng tiếng Anh thống nhất.
- Không tự tạo thêm kiến trúc hoặc thư mục cấp cao mới nếu chưa cập nhật `docs/architecture/project-structure.md` và được người phụ trách chấp thuận.
- Không tạo cấu trúc song song như `client/`, `server/`, `ml/`, `artificial-intelligence/` hoặc `apps/` để thay thế các thư mục gốc đã có.

## 2. Cấu trúc gốc duy nhất

| Thư mục | Trách nhiệm |
|---|---|
| `frontend/` | Ứng dụng React dành cho người dùng |
| `backend/` | API FastAPI, nghiệp vụ, dữ liệu và tích hợp bệnh viện |
| `ai/` | Dịch vụ tối ưu, dự báo, cấu hình mô hình và quản trị AI |
| `docs/` | Yêu cầu, nghiệp vụ, kiến trúc và hướng dẫn phát triển |
| `giaodien/` | Giao diện nguyên mẫu từ Figma Make để đối chiếu, không phải mã sản xuất |

**API, Application Programming Interface – giao diện lập trình ứng dụng** là hợp đồng dữ liệu để các phần mềm trao đổi với nhau.
**AI, Artificial Intelligence – trí tuệ nhân tạo** là phần tạo dự báo hoặc đề xuất; AI không có quyền thay quyết định chuyên môn.

## 3. Quy trình GitNexus bắt buộc khi sửa mã

Không cần chạy GitNexus khi chỉ tạo hoặc sửa tệp tài liệu trong `docs/` hay tệp Markdown.

Khi sửa mã hoặc thêm tính năng:

1. Chạy `npx gitnexus status`.
2. Nếu chưa có chỉ mục hoặc chỉ mục cũ, chạy `npx gitnexus analyze`.
3. Dùng `npx gitnexus query -r Null-Pointer "<khái niệm>"` để tìm luồng liên quan.
4. Dùng `npx gitnexus context -r Null-Pointer <tên>` để đọc quan hệ của thành phần cần sửa.
5. Dùng `npx gitnexus impact -r Null-Pointer <mã-thành-phần>` trước khi sửa hàm, lớp hoặc phương thức đang có.
6. Nếu rủi ro `HIGH` hoặc `CRITICAL`, dừng và báo người phụ trách trước khi sửa.
7. Sau khi sửa, chạy kiểm thử của phần bị ảnh hưởng.
8. Chạy `npx gitnexus detect-changes -r Null-Pointer --scope unstaged`.
9. Chạy lại `npx gitnexus analyze` sau thay đổi mã lớn hoặc trước khi bàn giao.

**GitNexus – công cụ lập bản đồ quan hệ mã nguồn** giúp tìm thành phần phụ thuộc, luồng thực thi và phạm vi có thể bị ảnh hưởng khi sửa mã.

## 4. Quy tắc phụ thuộc

### Frontend

```text
app → features → entities → shared
```

- `shared` không được nhập từ `entities`, `features` hoặc `app`.
- `entities` chỉ được nhập từ `shared`.
- Một `feature` không nhập tệp nội bộ của `feature` khác.
- `app` chỉ lắp ghép tuyến đường, nhà cung cấp trạng thái và bố cục.

### Backend

```text
api → service/use case → domain → repository port
                            ↓
                    infrastructure adapter
```

- Bộ định tuyến không chứa quy tắc nghiệp vụ.
- Kho truy cập dữ liệu không quyết định thứ tự y tế.
- Miền nghiệp vụ không phụ thuộc FastAPI, SQLAlchemy hoặc nhà cung cấp AI.

### AI

- AI chỉ nhận dữ liệu đã được backend kiểm tra và chỉ trả đề xuất.
- AI không ghi trực tiếp vào cơ sở dữ liệu nghiệp vụ.
- Backend phải kiểm tra lại ràng buộc an toàn trước khi lưu hoặc hiển thị đề xuất.
- Khi AI lỗi hoặc quá thời gian, hệ thống phải thất bại an toàn hoặc dùng bộ quy tắc cố định đã phê duyệt.

## 5. Quy tắc y tế và dữ liệu

- Không tạo, sửa, hủy hoặc suy diễn thêm chỉ định của bác sĩ.
- Không thay đổi mức ưu tiên lâm sàng.
- Không bỏ điều kiện nhịn ăn, cách ly, hỗ trợ di chuyển hoặc quan hệ trước–sau.
- Không ghi thông tin bệnh nhân, mã truy cập, khóa bí mật hoặc dữ liệu y tế vào nhật ký trình duyệt.
- Mọi thay đổi hành trình phải có lý do, thời điểm, phiên bản dữ liệu và người hoặc hệ thống thực hiện.
- Không giải phóng chỗ cũ trước khi chỗ mới được xác nhận.

## 6. Quy tắc thay đổi cấu trúc

Nếu thật sự cần thư mục hoặc lớp kiến trúc mới:

1. Chứng minh cấu trúc hiện tại không đáp ứng được.
2. Chạy GitNexus để tìm nơi phù hợp và phạm vi ảnh hưởng.
3. Cập nhật tài liệu cấu trúc trước.
4. Không di chuyển hàng loạt và thay đổi nghiệp vụ trong cùng một lần sửa.
5. Bổ sung kiểm thử và hướng dẫn di chuyển.
