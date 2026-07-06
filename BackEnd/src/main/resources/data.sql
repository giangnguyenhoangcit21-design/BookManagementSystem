-- CHÈN DỮ LIỆU MẪU
INSERT INTO users (username, password, role)
VALUES 
('admin_thay_giao', '$2a$10$DowrM2.x/R.d6a8P4fCj4OGf6lOQ8yXbV9K8R1O.w7xR4w5l8Q7mC', 'ROLE_ADMIN'),
('dev_sinh_vien', '$2a$10$DowrM2.x/R.d6a8P4fCj4OGf6lOQ8yXbV9K8R1O.w7xR4w5l8Q7mC', 'ROLE_USER');

-- Chèn sách mẫu
INSERT INTO books (title, author, price, description, created_by)
VALUES 
(N'Lập trình Spring Boot Căn Bản', N'Nguyễn Văn A', 150000.00, N'Sách hướng dẫn làm RESTful API cực dễ hiểu.', 1),
(N'Clean Code (Mã Sạch)', N'Robert C. Martin', 250000.00, N'Sách gối đầu giường của mọi lập trình viên.', 2);
