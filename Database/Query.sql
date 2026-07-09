-- 1. Tạo cơ sở dữ liệu
CREATE DATABASE BookManagementDB;
GO

-- Sử dụng Database vừa tạo
USE BookManagementDB;
GO

CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'ROLE_USER' NOT NULL
);
GO

CREATE TABLE books (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,       -- NVARCHAR để lưu tiếng Việt có dấu
    author NVARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0), -- Ngăn chặn nhập giá âm
    description NVARCHAR(MAX),
    created_by BIGINT,                  -- Cột liên kết với bảng users
    
    -- Ràng buộc khóa ngoại: Cột created_by phải tham chiếu đến cột id của bảng users
    CONSTRAINT FK_books_users FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

-- CHÈN DỮ LIỆU MẪU
INSERT INTO users (username, password, role)
VALUES 
('admin_thay_giao', '123456', 'ROLE_ADMIN'),
('dev_sinh_vien', '123456', 'ROLE_USER');
GO

-- Chèn sách mẫu
-- Quyển 1 do admin tạo (created_by = 1)
-- Quyển 2 do user tạo (created_by = 2)
INSERT INTO books (title, author, price, description, created_by)
VALUES 
(N'Lập trình Spring Boot Căn Bản', N'Nguyễn Văn A', 150000.00, N'Sách hướng dẫn làm RESTful API cực dễ hiểu.', 1),
(N'Clean Code (Mã Sạch)', N'Robert C. Martin', 250000.00, N'Sách gối đầu giường của mọi lập trình viên.', 2);
GO

CREATE TABLE borrow_records (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    status NVARCHAR(50) NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED', 'RETURNED'
    request_date DATETIME DEFAULT GETDATE(), -- Ngày gửi yêu cầu
    borrow_date DATETIME NULL, -- Ngày Admin phê duyệt cho mượn
    due_date DATETIME NULL,    -- Hạn cuối phải trả (Ví dụ: borrow_date + 14 ngày)
    return_date DATETIME NULL, -- Ngày thực tế User trả sách
    
    -- Thiết lập khóa ngoại liên kết tới bảng users và books
    CONSTRAINT FK_Borrow_User FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_Borrow_Book FOREIGN KEY (book_id) REFERENCES books(id)
);
GO

-- 2. Bảng reviews dành cho tính năng đánh giá sách
CREATE TABLE reviews (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Reviews_User FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_Reviews_Book FOREIGN KEY (book_id) REFERENCES books(id)
);
GO
