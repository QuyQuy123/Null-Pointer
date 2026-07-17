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

## Cấu trúc thư mục Backend

Backend được đặt trong thư mục `backend/`, tổ chức theo kiến trúc nhiều lớp để tách rõ API, xử lý nghiệp vụ, truy cập dữ liệu, machine learning và cấu hình hệ thống.

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── ml/
│   ├── middleware/
│   ├── utils/
│   └── exceptions/
├── tests/
├── uploads/
├── requirements.txt
├── .env
├── Dockerfile
└── README.md
```

### `app/`

Chứa toàn bộ source code chính của backend.

### `app/main.py`

Điểm khởi chạy ứng dụng backend, thường dùng để tạo FastAPI app, đăng ký router, middleware và cấu hình startup/shutdown.

### `app/api/`

Chứa các endpoint API theo từng nhóm chức năng.

- `router.py`: router tổng, gom các router nhỏ và đăng ký prefix chung.
- `auth.py`: API đăng nhập, đăng ký, refresh token, đăng xuất.
- `users.py`: API quản lý thông tin người dùng.
- `admin.py`: API dành cho admin, ví dụ dashboard, quản lý dữ liệu hoặc cấu hình hệ thống.

### `app/core/`

Chứa cấu hình lõi và các thành phần nền tảng của backend.

- `config.py`: đọc biến môi trường và cấu hình ứng dụng.
- `database.py`: cấu hình kết nối database/session.
- `security.py`: xử lý bảo mật như hash mật khẩu, JWT, xác thực token.
- `dependencies.py`: các dependency dùng chung cho route, ví dụ lấy user hiện tại hoặc kiểm tra quyền.

### `app/models/`

Chứa ORM models đại diện cho các bảng trong database.

- `user.py`: model người dùng.

### `app/schemas/`

Chứa các schema dùng để validate request và format response, thường dùng Pydantic.

- `auth.py`: schema cho đăng nhập, đăng ký, token và thông tin xác thực.

### `app/repositories/`

Chứa lớp truy cập dữ liệu, tách logic query database khỏi service.

- `user_repository.py`: các hàm thao tác dữ liệu liên quan đến người dùng.

### `app/services/`

Chứa logic nghiệp vụ chính của hệ thống.

- `auth_service.py`: xử lý nghiệp vụ đăng nhập, đăng ký, tạo token, kiểm tra tài khoản.

### `app/ml/`

Chứa phần xử lý machine learning hoặc AI.

- `predictor.py`: gọi model và trả kết quả dự đoán.
- `preprocessing.py`: tiền xử lý dữ liệu đầu vào trước khi đưa vào model.
- `model.pkl`: file model đã huấn luyện.

### `app/middleware/`

Chứa middleware xử lý request/response, ví dụ logging, CORS mở rộng, tracking request hoặc xử lý lỗi tập trung.

### `app/utils/`

Chứa các hàm tiện ích dùng chung cho backend, ví dụ format dữ liệu, xử lý thời gian, tạo mã, validate bổ sung.

### `app/exceptions/`

Chứa custom exception và handler lỗi chung để response lỗi nhất quán.

### `tests/`

Chứa unit test và integration test cho backend.

### `uploads/`

Chứa các file người dùng upload hoặc file tạm phục vụ quá trình xử lý.

### `requirements.txt`

Khai báo danh sách thư viện Python cần cài đặt cho backend.

### `.env`

Chứa biến môi trường như database URL, secret key, cấu hình JWT hoặc thông tin kết nối dịch vụ ngoài.

### `Dockerfile`

File cấu hình build Docker image cho backend.

### `backend/README.md`

Tài liệu riêng cho backend, có thể mô tả cách cài đặt, chạy server, migrate database và chạy test.
