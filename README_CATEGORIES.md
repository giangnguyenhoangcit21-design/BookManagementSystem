# Hướng dẫn kết nối API Hệ thống Bộ lọc & Phân loại Sách (Update Categories System)

Tài liệu này đặc tả luồng hoạt động của hệ thống phân loại (Categories), bộ lọc (Filters), sắp xếp (Sorting), huy hiệu mượn (Status Badges), và phân trang (Pagination) vừa được cập nhật tại giao diện Frontend, đồng thời cung cấp hướng dẫn kết nối API dành cho nhóm phát triển Backend.

---

## 1. Tổng quan cơ chế hiện tại ở Frontend

Để hệ thống hoạt động ngay lập tức mà không yêu cầu sửa đổi cấu trúc Backend, Frontend đã được cấu hình tự động xử lý dữ liệu ở Client-side (Client-side processing) dựa trên danh sách sách lấy về từ API `GET /api/books` và lịch sử mượn từ `GET /api/borrows/my`:

1. **Phân loại (Categories)**:
   - Tự động phân tích chuỗi tiêu đề sách để gán thể loại:
     - Nếu tiêu đề chứa: `"lập trình"`, `"spring"`, `"code"`, `"java"` $\rightarrow$ Thể loại: `"Lập trình"`
     - Nếu tiêu đề chứa: `"kinh tế"`, `"tài chính"`, `"khởi nghiệp"`, `"startup"` $\rightarrow$ Thể loại: `"Kinh tế"`
     - Nếu tiêu đề chứa: `"kỹ năng"`, `"sống"`, `"đắc nhân tâm"` $\rightarrow$ Thể loại: `"Kỹ năng"`
     - Các trường hợp còn lại $\rightarrow$ Thể loại: `"Khác"`
2. **Huy hiệu Trạng thái mượn (Active Borrow Badges)**:
   - Gọi API `GET /api/borrows/my` để tải danh sách các lượt mượn của tài khoản hiện tại.
   - Lọc và hiển thị huy hiệu `Chờ duyệt` (đối với trạng thái `PENDING`) và `Đang mượn` (đối với trạng thái `APPROVED`) ngay trên thẻ sách.
3. **Bộ lọc & Sắp xếp**:
   - Lọc theo Thể loại được chọn từ thanh Tab.
   - Lọc theo sách còn sẵn (`available == true`).
   - Lọc theo sách yêu thích (so sánh với ID trong danh sách favorites ở localStorage).
   - Sắp xếp theo giá (tăng/giảm dần) hoặc sắp xếp theo điểm đánh giá trung bình.
4. **Tải thêm (Load More)**:
   - Giới hạn hiển thị ban đầu là 8 cuốn sách và tải thêm 8 cuốn mỗi lần bấm nút `"Xem thêm sách"`.

---

## 2. Hướng đi cho nhóm Backend để nâng cấp kết nối API thực tế

Khi nhóm Backend sẵn sàng mở rộng các tính năng này để xử lý tại Server-side (Database level) giúp tăng hiệu năng hệ thống khi kho sách lớn hơn, Backend cần cung cấp và cập nhật các endpoint sau:

### 2.1. Cập nhật API Danh sách sách (`GET /api/books`)
Chuyển đổi API danh sách sách hiện tại từ trả về mảng phẳng (`List<Book>`) sang trả về đối tượng phân trang (`Page<Book>`) hỗ trợ các tham số truy vấn:

- **Path**: `GET /api/books`
- **Query Parameters**:
  - `page` (int, mặc định `0`): Vị trí trang hiện tại.
  - `size` (int, mặc định `8`): Số lượng sách trên một trang.
  - `search` (string, tùy chọn): Tìm kiếm gần đúng theo tiêu đề hoặc tác giả.
  - `category` (string, tùy chọn): Lọc theo danh mục thể loại (Ví dụ: `Lập trình`, `Kinh tế`, `Kỹ năng`, `Khác`).
  - `availableOnly` (boolean, tùy chọn): Nếu `true`, chỉ trả về các sách chưa bị mượn hết.
  - `sortBy` (string, mặc định `id`): Cột cần sắp xếp (ví dụ: `price` - giá, `averageRating` - đánh giá sao, `createdAt` - ngày tạo).
  - `direction` (string, mặc định `desc`): Hướng sắp xếp (`asc` - tăng dần, `desc` - giảm dần).

**Định dạng JSON trả về chuẩn Page (Ví dụ từ Spring Data Pageable):**
```json
{
  "content": [
    {
      "id": "1",
      "title": "Lập trình Spring Boot Căn Bản",
      "author": "Nguyễn Văn A",
      "price": 150000.00,
      "category": "Lập trình",
      "available": true,
      "averageRating": 4.5
    }
  ],
  "page": 0,
  "size": 8,
  "totalElements": 25,
  "totalPages": 4,
  "last": false
}
```

### 2.2. API lấy danh sách Thể loại (`GET /api/books/categories`)
Cung cấp một endpoint công khai để Frontend lấy danh sách tất cả các danh mục thể loại sách hiện có nhằm hiển thị động lên thanh Tabs.

- **Path**: `GET /api/books/categories`
- **Quyền truy cập**: Public
- **Định dạng phản hồi (JSON array)**:
  ```json
  ["Lập trình", "Kinh tế", "Kỹ năng", "Khác"]
  ```

### 2.3. API lấy trạng thái mượn của User hiện tại (`GET /api/borrows/my/active-status`)
Để tối ưu hóa việc gắn huy hiệu mượn trên giao diện mà không cần Frontend phải tải và lặp qua toàn bộ lịch sử mượn sách của User, Backend có thể cung cấp API rút gọn:

- **Path**: `GET /api/borrows/my/active-status`
- **Quyền truy cập**: Đã đăng nhập (Header `Authorization: Bearer <JWT_Token>`)
- **Định dạng phản hồi (JSON Map)**:
  ```json
  {
    "1": "APPROVED",
    "3": "PENDING"
  }
  ```
  *(Map chứa khóa là `bookId` và giá trị là trạng thái mượn hiện tại như `PENDING` hoặc `APPROVED`)*
