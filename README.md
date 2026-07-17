# Null-Pointer

## Cấu trúc thư mục Frontend

Frontend được đặt trong thư mục `frontend/`, sử dụng cấu trúc theo từng nhóm chức năng để dễ mở rộng và bảo trì.

```text
frontend/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── hooks/
│   ├── contexts/
│   ├── store/
│   ├── utils/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

### `public/`

Chứa các file tĩnh được phục vụ trực tiếp bởi Vite, ví dụ: favicon, ảnh public, file cấu hình tĩnh hoặc asset không cần import qua JavaScript.

### `src/`

Chứa toàn bộ source code chính của frontend.

### `src/api/`

Chứa các file xử lý giao tiếp với backend API.

- `axios.js`: cấu hình instance Axios dùng chung, base URL, interceptor, token.
- `authApi.js`: các API liên quan đến đăng nhập, đăng ký, đăng xuất, refresh token.
- `userApi.js`: các API liên quan đến thông tin người dùng.
- `predictionApi.js`: các API liên quan đến dự đoán, điều phối hoặc kết quả AI.

### `src/assets/`

Chứa tài nguyên được import trong code như ảnh, icon, font, illustration hoặc file media dùng trong giao diện.

### `src/components/`

Chứa các UI component dùng lại nhiều lần trong hệ thống.

- `Button/`: component nút bấm dùng chung.
- `Navbar/`: thanh điều hướng phía trên.
- `Sidebar/`: thanh điều hướng bên trái, thường dùng cho giao diện admin.
- `Card/`: khối hiển thị thông tin dạng card.
- `Modal/`: hộp thoại popup dùng cho xác nhận, form nhanh hoặc cảnh báo.

### `src/layouts/`

Chứa layout tổng cho từng nhóm người dùng hoặc từng khu vực giao diện.

- `AdminLayout.jsx`: layout cho trang quản trị, thường gồm sidebar, header và vùng nội dung chính.
- `UserLayout.jsx`: layout cho người dùng/customer, ưu tiên đơn giản, dễ thao tác.

### `src/pages/`

Chứa các page chính tương ứng với route trong ứng dụng.

- `Login/`: trang đăng nhập.
- `Register/`: trang đăng ký.
- `Dashboard/`: trang tổng quan.
- `Prediction/`: trang dự đoán, gợi ý hoặc điều phối bằng AI.
- `History/`: trang lịch sử thao tác, lịch sử khám hoặc lịch sử dự đoán.
- `Admin/`: các trang dành cho admin.

### `src/routes/`

Chứa cấu hình định tuyến của ứng dụng.

- `AppRoutes.jsx`: định nghĩa route, layout tương ứng và phân quyền truy cập nếu cần.

### `src/hooks/`

Chứa custom React hooks dùng lại trong nhiều nơi, ví dụ: `useAuth`, `useDebounce`, `useFetch`, `usePagination`.

### `src/contexts/`

Chứa React Context dùng để chia sẻ state toàn cục ở phạm vi ứng dụng, ví dụ: thông tin đăng nhập, theme, ngôn ngữ hoặc quyền người dùng.

### `src/store/`

Chứa state management nếu dự án dùng Redux, Zustand hoặc một cơ chế quản lý state tập trung khác.

### `src/utils/`

Chứa các hàm tiện ích dùng chung, ví dụ: format ngày giờ, format số, validate dữ liệu, xử lý token hoặc mapping trạng thái.

### `src/styles/`

Chứa style dùng chung toàn ứng dụng như biến màu, reset CSS, typography, layout base hoặc file CSS global.

### `src/App.jsx`

Component gốc của ứng dụng frontend, thường dùng để bọc router, provider và layout chính.

### `src/main.jsx`

Điểm khởi chạy ứng dụng React, render `App.jsx` vào DOM.

### `package.json`

Khai báo dependencies, devDependencies và các script chạy frontend như `dev`, `build`, `preview`, `lint`.

### `vite.config.js`

File cấu hình Vite, dùng để cấu hình plugin React, alias, server port hoặc các thiết lập build.
