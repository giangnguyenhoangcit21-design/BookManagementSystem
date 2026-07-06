# BÁO CÁO PHÁT TRIỂN TÍNH NĂNG MỚI
**Dự án:** Book Management System  
**Tính năng:** Hệ thống Đánh giá và Bình luận Sách (Book Review & Rating)  
**Nền tảng:** Spring Boot (Backend)  

---

## 1. Giới thiệu Tính năng
Nhằm tăng tính tương tác và cung cấp thông tin trực quan cho người dùng, hệ thống đã được tích hợp thêm chức năng **Đánh giá và Bình luận Sách**. Người dùng sau khi đăng nhập có thể:
- Chấm điểm cuốn sách theo thang từ 1 đến 5 sao.
- Viết nhận xét cá nhân về cuốn sách.
- Xem điểm đánh giá trung bình và đọc các bình luận của những độc giả khác.

## 2. Kiến trúc Code (Chuẩn 3-Layer Architecture)
Toàn bộ code được viết tuân thủ nghiêm ngặt theo tài liệu hướng dẫn cấu trúc code của dự án, đảm bảo nguyên tắc phân tách trách nhiệm (Separation of Concerns).

### 2.1. Layer Controller (`ReviewController`)
- **Nhiệm vụ:** Nhận HTTP Request từ phía Frontend (React), chuyển tiếp xuống Service và trả về HTTP Response.
- **Tuân thủ:** Không chứa bất kỳ business logic nào. Các API đều được bọc trong khối `try-catch` để xử lý ngoại lệ đồng nhất với dự án.

### 2.2. Layer Service (`ReviewService` & `ReviewServiceImpl`)
- **Nhiệm vụ:** Xử lý 100% nghiệp vụ logic, kiểm tra tính hợp lệ của số sao (1-5), kiểm tra sự tồn tại của User và Book trước khi thêm vào Database.
- **Tuân thủ:** Sử dụng `@Transactional` để đảm bảo an toàn dữ liệu khi thực hiện lệnh ghi (Thêm đánh giá mới).

### 2.3. Layer Repository (`ReviewRepository`)
- **Nhiệm vụ:** Tương tác trực tiếp với Database qua Spring Data JPA.
- **Tính năng nổi bật:** Sử dụng annotation `@Query` để tính toán tự động điểm trung bình (`AVG(rating)`) trực tiếp trên Database nhằm tối ưu hiệu năng.

### 2.4. Layer DTO (Data Transfer Object)
- **Nhiệm vụ:** Chuyển giao dữ liệu giữa Backend và Frontend.
- **Tuân thủ:** Phân tách rõ ràng giữa Request (`ReviewRequestDTO`) và Response (`ReviewResponseDTO`) để không làm lộ cấu trúc Entity và Database.

### 2.5. Layer Entity (`Review`)
- Bảng mới `reviews` được ánh xạ thông qua ORM Hibernate.
- Khóa ngoại liên kết chặt chẽ tới bảng `users` và `books`.

## 3. Danh sách API (Dành cho Frontend)

### API 1: Thêm đánh giá mới
- **Method:** `POST`
- **URL:** `/api/reviews`
- **Yêu cầu:** Bắt buộc đăng nhập (Có JWT Token).
- **Body Request (JSON):**
  ```json
  {
      "bookId": 1,
      "rating": 5,
      "comment": "Sách rất hay và ý nghĩa!"
  }
  ```

### API 2: Lấy danh sách bình luận của sách
- **Method:** `GET`
- **URL:** `/api/reviews/book/{bookId}`
- **Yêu cầu:** Public (Không cần đăng nhập).
- **Mô tả:** Trả về danh sách tất cả các bình luận của một cuốn sách cụ thể, sắp xếp theo thời gian mới nhất.

### API 3: Lấy điểm đánh giá trung bình
- **Method:** `GET`
- **URL:** `/api/reviews/book/{bookId}/average`
- **Yêu cầu:** Public (Không cần đăng nhập).
- **Mô tả:** Trả về một con số thập phân (VD: 4.5) thể hiện điểm sao trung bình của sách.

---

## 4. Tóm tắt kết quả
- **Tổng số file code được viết thêm:** 06 file mới.
- **Tình trạng:** Biên dịch (Compile) thành công 100% không xuất hiện lỗi.
- **Mức độ an toàn:** Được code trên một nhánh Git tách biệt (`feature/book-review`), không gây xung đột (conflict) với bất kỳ code hiện tại nào của nhóm. Sẵn sàng để hợp nhất (Merge) vào nhánh `main`.
