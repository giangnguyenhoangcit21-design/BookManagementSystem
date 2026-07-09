# Hướng dẫn kết nối API Đánh giá & Bình luận (Book Review) giữa Frontend và Backend

Tài liệu này hướng dẫn cách kết nối các chức năng Đánh giá & Bình luận sách vừa được cập nhật ở giao diện Frontend với các API tương ứng ở Backend.

---

## 1. Danh sách các API Endpoints từ Backend

Giao diện Frontend hiện tại gọi các REST API của Backend tại địa chỉ `http://localhost:8080/api` thông qua các endpoint sau:

### 1.1. Lấy điểm đánh giá trung bình của cuốn sách
- **Method / Path**: `GET /api/reviews/book/{bookId}/average`
- **Quyền truy cập**: Public (Không cần JWT Token)
- **Tham số**:
  - `bookId`: ID của cuốn sách (Kiểu số nguyên `Long`).
- **Định dạng phản hồi (Response Body)**:
  - Trả về trực tiếp một giá trị số thực `Double` đại diện cho điểm trung bình (Ví dụ: `4.5`).
  - Định dạng JSON mẫu:
    ```json
    4.5
    ```

### 1.2. Lấy danh sách các bình luận của cuốn sách
- **Method / Path**: `GET /api/reviews/book/{bookId}`
- **Quyền truy cập**: Public (Không cần JWT Token)
- **Tham số**:
  - `bookId`: ID của cuốn sách (Kiểu số nguyên `Long`).
- **Định dạng phản hồi (Response Body)**:
  - Trả về một mảng JSON gồm các đối tượng đánh giá, sắp xếp theo thời gian mới nhất trước.
  - Định dạng JSON mẫu:
    ```json
    [
      {
        "id": 1,
        "bookId": 1,
        "username": "admin_thay_giao",
        "rating": 5,
        "comment": "Sách viết rất hay, dễ hiểu cho người mới bắt đầu học Spring Boot!",
        "createdAt": "2026-07-09T10:00:00"
      },
      {
        "id": 2,
        "bookId": 1,
        "username": "dev_sinh_vien",
        "rating": 4,
        "comment": "Tài liệu chi tiết, các ví dụ rõ ràng.",
        "createdAt": "2026-07-09T11:30:00"
      }
    ]
    ```

### 1.3. Gửi đánh giá mới cho cuốn sách
- **Method / Path**: `POST /api/reviews`
- **Quyền truy cập**: Đã đăng nhập (Yêu cầu Header `Authorization: Bearer <JWT_Token>`)
- **Định dạng yêu cầu (Request Body)**:
  - Kiểu nội dung: `application/json`
  - Định dạng JSON mẫu:
    ```json
    {
      "bookId": 1,
      "rating": 5,
      "comment": "Nội dung cực kỳ chất lượng, rất đáng mua!"
    }
    ```
- **Định dạng phản hồi (Response Body)**:
  - Trả về đối tượng đánh giá vừa được tạo thành công trong Database.
  - Định dạng JSON mẫu:
    ```json
    {
      "id": 3,
      "bookId": 1,
      "username": "dev_sinh_vien",
      "rating": 5,
      "comment": "Nội dung cực kỳ chất lượng, rất đáng mua!",
      "createdAt": "2026-07-09T12:15:00"
    }
    ```

---

## 2. Cách thức xử lý Offline Fallback ở Frontend

Để hỗ trợ kiểm thử giao diện thuận tiện ngay cả khi **Backend chưa được bật**, Frontend đã được cấu hình cơ chế tự động giả lập như sau:
1. Khi gọi bất kỳ API Review nào, hệ thống sẽ cố gắng kết nối tới `http://localhost:8080/api`.
2. Nếu xảy ra lỗi kết nối (`Failed to fetch` do server backend chưa chạy), Frontend sẽ chuyển sang **chế độ Offline/Mock**:
   - Lấy danh sách đánh giá mẫu đã định nghĩa sẵn cho cuốn Spring Boot (ID = 1) và Clean Code (ID = 2).
   - Điểm trung bình được hiển thị mặc định lần lượt là `4.5` và `5.0`.
   - Khi gửi đánh giá mới, bình luận sẽ tự động được thêm tạm thời vào danh sách giao diện bằng tên tài khoản hiện tại mà không báo lỗi mạng.

---

## 3. Cách kiểm tra kết nối Thực tế

Khi bạn đã bật SQL Server và khởi chạy Backend Spring Boot thành công bằng lệnh:
```powershell
.\mvnw.cmd spring-boot:run
```
Giao diện Frontend sẽ **tự động kết nối trực tiếp với Database thực tế** khi bạn thực hiện tải trang và gửi đánh giá, không sử dụng dữ liệu giả lập (mock data) nữa.
