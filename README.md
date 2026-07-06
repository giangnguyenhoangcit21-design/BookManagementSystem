# Dự Án Hệ Thống Quản Lý Sách (Book Management System)

Dự án này là ứng dụng web quản lý sách cơ bản được xây dựng theo mô hình Full-stack, kết hợp giữa **Spring Boot (Backend)**, **Next.js / React (Frontend)** và **Microsoft SQL Server (Database)**. 

Hệ thống áp dụng kiến trúc **3-Tier Architecture** kết hợp bảo mật **Spring Security & Stateless JWT (JSON Web Token)** để phân quyền và quản lý tài nguyên.

---

## 1. Các Phần Chính Trong Dự Án (Project Components)

Dự án được phân chia thành 3 phần rõ rệt:

1. **`BackEnd/`**: API RESTful được viết bằng Java (Spring Boot), chịu trách nhiệm xử lý logic nghiệp vụ, xác thực người dùng và tương tác trực tiếp với Database qua Spring Data JPA.
2. **`FrontEnd/`**: Giao diện người dùng được xây dựng bằng Next.js (React) kết hợp Tailwind CSS, thực hiện gọi API từ Backend và hiển thị giao diện động cho người dùng.
3. **`Database/`**: Chứa script SQL Server (`Query.sql`) dùng để khởi tạo cơ sở dữ liệu và dữ liệu mẫu.

---

## 2. Nguyên Lý Hoạt Động (System Architecture & Principles)

### Mô hình kiến trúc 3 lớp (3-Tier Architecture) của Backend:
```
Client (FrontEnd Next.js)
        │  ▲
        │  │ HTTP Requests (JSON) / JWT Bearer Token
        ▼  │
 lớp Controller (AuthController, BookController)
        │  ▲
        │  │ DTOs (Data Transfer Objects)
        ▼  │
 lớp Service (AuthService, BookService) - Xử lý nghiệp vụ (Business Logic)
        │  ▲
        │  │ Entities (User, Book)
        ▼  │
 lớp Repository (UserRepository, BookRepository) - Spring Data JPA
        │  ▲
        │  │ JDBC Driver
        ▼  │
  Database (Microsoft SQL Server)
```

### Nguyên lý hoạt động chi tiết:
1. **Xác thực & Phân quyền (Security & Auth)**:
   * Khi người dùng đăng ký hoặc đăng nhập thông qua các API công khai `/api/auth/**`, mật khẩu sẽ được mã hóa bằng thuật toán mã hóa một chiều **BCrypt**.
   * Nếu thông tin đăng nhập chính xác, Backend sẽ tạo ra một mã **JWT (JSON Web Token)** chứa thông tin người dùng và quyền hạn của họ (Role: USER/ADMIN) rồi gửi về cho Frontend.
   * Mã JWT này có thời gian hết hạn nhất định và được ký bằng khóa bảo mật phía Server (`app.jwt.secret`).
2. **Bảo vệ tài nguyên sách (Protected Resource)**:
   * Mọi yêu cầu liên quan đến sách (`/api/books/**`) đều được lọc qua `JwtAuthenticationFilter`. Bộ lọc này sẽ kiểm tra Header `Authorization: Bearer <JWT_Token>` của request.
   * Nếu Token hợp lệ, thông tin người dùng sẽ được lưu vào `SecurityContext` của Spring Security để cấp quyền tiếp tục thực hiện hành động.
   * Nếu không hợp lệ hoặc thiếu Token, hệ thống trả về mã lỗi `403 Forbidden`.
3. **Truy cập Database**:
   * Khi các tác vụ CRUD (Thêm, Đọc, Sửa, Xóa) sách được thực hiện, Service sẽ gọi xuống Repository (sử dụng Hibernate/Spring Data JPA) để ánh xạ trực tiếp thành các câu lệnh SQL tương tác với cơ sở dữ liệu SQL Server.
4. **Cơ chế CORS**:
   * Vì Frontend (`http://localhost:3000`) khác cổng với Backend (`http://localhost:8080`), Backend đã được cấu hình CORS (`CorsConfigurationSource`) để cho phép cổng `3000` thực hiện đầy đủ các phương thức HTTP như `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.

---

## 3. Cấu Trúc Chi Tiết Từng Phần (File & Folder Structure)

### 3.1. Backend (`BackEnd/src/main/java/com/team/bookmanagement/`)
* **`controller/`**: Điểm tiếp nhận request từ Client.
  * `AuthController.java`: Xử lý đăng ký (`/register`) và đăng nhập (`/login`).
  * `BookController.java`: Cung cấp các API CRUD sách (`/api/books`).
* **`service/`**: Xử lý logic nghiệp vụ và ràng buộc hệ thống.
  * `BookService.java` & `impl/BookServiceImpl.java`: Logic kiểm tra giá sách (phải >= 0), kiểm tra quyền sở hữu (User chỉ sửa được sách của mình, Admin sửa được mọi sách).
  * `AuthService.java` & `impl/AuthServiceImpl.java`: Logic mã hóa BCrypt, đăng ký người dùng mới và tạo xác thực.
* **`repository/`**: Tầng giao tiếp với database.
  * `UserRepository.java`: Tìm kiếm User theo Username.
  * `BookRepository.java`: Thực hiện các truy vấn cơ bản về Sách.
* **`model/`**: Định nghĩa cấu trúc dữ liệu.
  * **`entity/`**: Ánh xạ trực tiếp thành các bảng trong SQL Server.
    * `User.java`: Mapped với bảng `users` (id, username, password, role).
    * `Book.java`: Mapped với bảng `books` (id, title, author, price, description, created_by).
  * **`dto/`**: Các đối tượng truyền nhận dữ liệu qua API để ẩn các thông tin nhạy cảm (như mật khẩu).
    * `request/`: `BookRequest`, `UserLoginRequest`, `UserRegisterRequest`.
    * `response/`: `BookResponse`, `UserResponse`, `JwtResponse`.
* **`security/`**: Chứa toàn bộ cấu hình bảo mật JWT.
  * `WebSecurityConfig.java`: Thiết lập phân quyền các URL, tắt CSRF và cấu hình CORS.
  * `JwtTokenProvider.java`: Tạo sinh token JWT và phân tích giải mã token.
  * `JwtAuthenticationFilter.java`: Bộ lọc chặn các request để xác thực token JWT gửi kèm.
  * `UserDetailsImpl.java` & `UserDetailsServiceImpl.java`: Cung cấp thông tin tài khoản người dùng cho Spring Security xác thực.

### 3.2. Frontend (`FrontEnd/`)
* **`app/`**: Cấu trúc thư mục định tuyến (App Router) của Next.js.
  * `(auth)/`: Nhóm các trang xác thực hệ thống.
    * `login/page.tsx`: Giao diện đăng nhập.
    * `register/page.tsx`: Giao diện đăng ký tài khoản.
  * `(user)/`: Nhóm các trang dành cho người dùng thông thường.
    * `dashboard/page.tsx`: Trang thư viện sách hiển thị danh sách sách.
    * `profile/page.tsx`: Giao diện thông tin tài khoản cá nhân.
  * `(admin)/`: Nhóm các trang quản lý của Admin.
    * `books/page.tsx`: Trang quản lý CRUD sách của admin.
  * `layout.tsx` & `page.tsx`: Layout tổng thể và trang chủ mặc định.
* **`lib/`**: Chứa các file tiện ích và kết nối.
  * `api.ts`: Khai báo endpoint `http://localhost:8080/api` và định nghĩa các hàm gọi fetch API tới Backend (`login`, `register`, `getBooks`, `createBook`, `updateBook`, `deleteBook`).
  * `auth-context.tsx`: Lưu trữ trạng thái đăng nhập toàn ứng dụng thông qua `localStorage` (key: `mock_user`).
* **`components/`**: Chứa các UI components dùng chung (Button, Card, Input,...).

---

## 4. Hướng Dẫn Cài Đặt Và Chạy Dự Án (How to Run)

### 4.1. Chuẩn bị Cơ sở dữ liệu (SQL Server)
1. Mở **SQL Server Configuration Manager**:
   * Bật giao thức **TCP/IP** của SQL Server thành `Enabled`.
   * Click đúp vào **TCP/IP** $\rightarrow$ chọn tab **IP Addresses** $\rightarrow$ đặt cổng ở mục **IPAll** là `1433` và xóa bỏ cổng dynamic.
   * Khởi động lại dịch vụ **SQL Server (MSSQLSERVER)**.
2. Mở SSMS (SQL Server Management Studio), đăng nhập bằng tài khoản `sa` / `123456`.
3. Chạy toàn bộ câu lệnh trong file [Query.sql](file:///d:/Intern/BookManagementSystem/BookManagementSystem/Database/Query.sql) để tạo database `BookManagementDB` và dữ liệu mẫu.

### 4.2. Khởi động Backend (Spring Boot)
1. Mở terminal tại thư mục `BackEnd/`.
2. Kiểm tra file `src/main/resources/application.properties` xem các thông số kết nối SQL Server đã khớp chưa.
3. Chạy lệnh sau để khởi động Backend:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
4. Khi log xuất hiện `Started BookManagementSystemApplication in ... seconds`, API đã chạy thành công tại địa chỉ `http://localhost:8080`.

### 4.3. Khởi động Frontend (Next.js)
1. Mở terminal tại thư mục `FrontEnd/`.
2. Đảm bảo bạn đã cài đặt các thư viện cần thiết bằng lệnh:
   ```powershell
   npm install
   ```
3. Khởi động môi trường phát triển (development server):
   ```powershell
   npm run dev
   ```
4. Mở trình duyệt và truy cập: `http://localhost:3000`.

---

## 5. Quy Trình Sử Dụng Thử Nghiệm Hệ Thống (Workflow Test)

1. Truy cập `http://localhost:3000/register` để đăng ký tài khoản (ví dụ: Username: `testuser`, Mật khẩu: `123456`).
2. Truy cập `http://localhost:3000/login` và nhập tài khoản vừa tạo.
3. Sau khi đăng nhập thành công, bạn sẽ được đưa đến trang Dashboard (`http://localhost:3000/dashboard`). Lúc này Frontend sẽ tự động gửi kèm JWT Token để lấy dữ liệu từ database SQL Server và hiển thị danh sách sách trên giao diện.
