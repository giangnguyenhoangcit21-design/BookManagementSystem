const API_URL = "http://localhost:8080/api";

export interface User {
  id: string; // Front-end uses string, backend may use long or string token
  name: string; // Mapped to username
  email: string;
  role: 'user' | 'admin' | string;
  avatar?: string;
  token?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price?: number;
  description: string;
  coverImage: string; // Mocked
  available: boolean; // Mocked
}

export interface BorrowRequest {
  id: string;
  bookId: string;
  userId: string;
  status: string;
  borrowDate: string;
  returnDate?: string;
}

export interface BorrowRecordResponse {
  id: number;
  userId: number;
  username: string;
  bookId: number;
  bookTitle: string;
  status: string;
  requestDate: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string;
  daysRemaining: number;
  isOverdue: boolean;
}

export interface ReviewResponse {
  id: number;
  bookId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// -------------------------
// REAL API (Connected to Backend)
// -------------------------

const getToken = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('mock_user');
    if (user) {
      try {
        const u = JSON.parse(user);
        return u.token || '';
      } catch(e) {}
    }
  }
  return '';
};

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (username: string, password?: string): Promise<User> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: password || "123456" }) // Fallback password if UI doesn't send
      });
      
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Login failed");
      }
      
      const data = await res.json();
      // data: { token, type, username, role }
      return {
        id: data.username,
        name: data.username,
        email: `${data.username}@system.com`,
        role: data.role === 'ROLE_ADMIN' ? 'admin' : 'user', // Mapping spring security roles
        token: data.token
      };
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Falling back to frontend mock auth.");
        const role = username === "admin_thay_giao" ? "admin" : "user";
        return {
          id: username,
          name: username,
          email: `${username}@system.com`,
          role: role,
          token: `mock-jwt-${role}-token`
        };
      }
      throw err;
    }
  },

  register: async (username: string, password?: string, role: string = 'user'): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password: password || "123456",
          role: role === 'admin' ? 'admin' : 'user'
        })
      });
      
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Register failed");
      }
      
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking register success.");
        return { username, role };
      }
      throw err;
    }
  },
  
  // Books (Real Backend CRUD)
  getBooks: async (): Promise<Book[]> => {
    try {
      const res = await fetch(`${API_URL}/books`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      return data.map((b: any) => ({
        id: b.id.toString(),
        title: b.title,
        author: b.author,
        price: b.price,
        description: b.description || "",
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop', // Mock
        available: true // Mock
      }));
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Returning mock books.");
        return [
          { id: "1", title: "Lập trình Spring Boot Căn Bản", author: "Nguyễn Văn A", price: 150000, description: "Sách hướng dẫn làm RESTful API cực dễ hiểu.", coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop', available: true },
          { id: "2", title: "Clean Code (Mã Sạch)", author: "Robert C. Martin", price: 250000, description: "Sách gối đầu giường của mọi lập trình viên.", coverImage: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?q=80&w=600&auto=format&fit=crop', available: true }
        ];
      }
      throw err;
    }
  },
  
  createBook: async (book: Omit<Book, 'id' | 'coverImage' | 'available'>): Promise<Book> => {
    const payload = {
      title: book.title,
      author: book.author,
      price: book.price || 0,
      description: book.description
    };
    try {
      const res = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create book");
      const b = await res.json();
      return {
        ...book,
        id: b.id.toString(),
        price: b.price,
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
        available: true
      };
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking createBook.");
        return {
          ...book,
          id: Math.floor(Math.random() * 1000 + 3).toString(),
          coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
          available: true
        };
      }
      throw err;
    }
  },
  
  updateBook: async (id: string, updates: Partial<Book>): Promise<Book> => {
    const payload = {
      title: updates.title,
      author: updates.author,
      price: updates.price,
      description: updates.description
    };
    try {
      const res = await fetch(`${API_URL}/books/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update book");
      const b = await res.json();
      return {
        id: b.id.toString(),
        title: b.title,
        author: b.author,
        price: b.price,
        description: b.description || "",
        coverImage: updates.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
        available: true
      };
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking updateBook.");
        return {
          id,
          title: updates.title || "",
          author: updates.author || "",
          price: updates.price || 0,
          description: updates.description || "",
          coverImage: updates.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
          available: true
        };
      }
      throw err;
    }
  },
  
  deleteBook: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${API_URL}/books/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete book");
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking deleteBook.");
        return;
      }
      throw err;
    }
  },

  // -------------------------
  // MOCK API (For Unimplemented Backend Features)
  // -------------------------
  
  getUsers: async (): Promise<User[]> => {
    await new Promise(r => setTimeout(r, 300));
    return [
      { id: 'admin', name: 'admin', email: 'admin@system.com', role: 'admin' },
      { id: 'user', name: 'user', email: 'user@system.com', role: 'user' }
    ];
  },
  
  // -------------------------
  // REAL API Borrows
  // -------------------------
  
  borrowBook: async (bookId: string): Promise<BorrowRecordResponse> => {
    try {
      const res = await fetch(`${API_URL}/borrows/request/${bookId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to borrow book");
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking borrowBook.");
        return {
          id: Math.floor(Math.random() * 1000 + 1),
          userId: 1,
          username: "dev_sinh_vien",
          bookId: parseInt(bookId),
          bookTitle: "Sách đã chọn",
          status: "PENDING",
          requestDate: new Date().toISOString().split('T')[0],
          borrowDate: "",
          dueDate: "",
          returnDate: "",
          daysRemaining: 14,
          isOverdue: false
        };
      }
      throw err;
    }
  },

  getUserBorrows: async (): Promise<BorrowRecordResponse[]> => {
    try {
      const res = await fetch(`${API_URL}/borrows/my`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch user borrows");
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Returning mock user borrows.");
        return [];
      }
      throw err;
    }
  },

  getAllBorrows: async (): Promise<BorrowRecordResponse[]> => {
    try {
      const res = await fetch(`${API_URL}/borrows/all`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch all borrows");
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Returning mock all borrows.");
        return [
          {
            id: 1,
            userId: 2,
            username: "dev_sinh_vien",
            bookId: 1,
            bookTitle: "Lập trình Spring Boot Căn Bản",
            status: "PENDING",
            requestDate: new Date().toISOString().split('T')[0],
            borrowDate: "",
            dueDate: "",
            returnDate: "",
            daysRemaining: 14,
            isOverdue: false
          }
        ];
      }
      throw err;
    }
  },

  approveBorrow: async (id: string, durationDays?: number): Promise<BorrowRecordResponse> => {
    try {
      const url = durationDays ? `${API_URL}/borrows/${id}/approve?durationDays=${durationDays}` : `${API_URL}/borrows/${id}/approve`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: getHeaders()
      });
      if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Failed to approve borrow");
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking approveBorrow.");
        return {
          id: parseInt(id),
          userId: 2,
          username: "dev_sinh_vien",
          bookId: 1,
          bookTitle: "Lập trình Spring Boot Căn Bản",
          status: "APPROVED",
          requestDate: new Date().toISOString().split('T')[0],
          borrowDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          returnDate: "",
          daysRemaining: 14,
          isOverdue: false
        };
      }
      throw err;
    }
  },

  rejectBorrow: async (id: string): Promise<BorrowRecordResponse> => {
    try {
      const res = await fetch(`${API_URL}/borrows/${id}/reject`, {
        method: 'PUT',
        headers: getHeaders()
      });
      if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Failed to reject borrow");
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking rejectBorrow.");
        return {
          id: parseInt(id),
          userId: 2,
          username: "dev_sinh_vien",
          bookId: 1,
          bookTitle: "Lập trình Spring Boot Căn Bản",
          status: "REJECTED",
          requestDate: new Date().toISOString().split('T')[0],
          borrowDate: "",
          dueDate: "",
          returnDate: "",
          daysRemaining: 0,
          isOverdue: false
        };
      }
      throw err;
    }
  },

  returnBook: async (id: string): Promise<BorrowRecordResponse> => {
    try {
      const res = await fetch(`${API_URL}/borrows/${id}/return`, {
        method: 'PUT',
        headers: getHeaders()
      });
      if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Failed to return book");
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking returnBook.");
        return {
          id: parseInt(id),
          userId: 2,
          username: "dev_sinh_vien",
          bookId: 1,
          bookTitle: "Lập trình Spring Boot Căn Bản",
          status: "RETURNED",
          requestDate: new Date().toISOString().split('T')[0],
          borrowDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          returnDate: new Date().toISOString().split('T')[0],
          daysRemaining: 0,
          isOverdue: false
        };
      }
      throw err;
    }
  },

  getFavorites: async (userId: string): Promise<Book[]> => {
    await new Promise(r => setTimeout(r, 300));
    return [];
  },

  toggleFavorite: async (userId: string, bookId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 300));
  },

  addReview: async (bookId: number, rating: number, comment: string): Promise<ReviewResponse> => {
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookId, rating, comment })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to add review");
      }
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Mocking addReview.");
        const userStr = localStorage.getItem('mock_user');
        let username = "dev_sinh_vien";
        if (userStr) {
          try {
            username = JSON.parse(userStr).name || "dev_sinh_vien";
          } catch (e) {}
        }
        return {
          id: Math.floor(Math.random() * 1000 + 1),
          bookId,
          username,
          rating,
          comment,
          createdAt: new Date().toISOString()
        };
      }
      throw err;
    }
  },

  getReviews: async (bookId: number): Promise<ReviewResponse[]> => {
    try {
      const res = await fetch(`${API_URL}/reviews/book/${bookId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Returning mock reviews.");
        if (bookId === 1) {
          return [
            {
              id: 101,
              bookId: 1,
              username: "admin_thay_giao",
              rating: 5,
              comment: "Sách viết rất hay, dễ hiểu cho người mới bắt đầu học Spring Boot!",
              createdAt: "2026-07-09T10:00:00Z"
            },
            {
              id: 102,
              bookId: 1,
              username: "dev_sinh_vien",
              rating: 4,
              comment: "Tài liệu chi tiết, các ví dụ rõ ràng và chạy được ngay.",
              createdAt: "2026-07-09T11:30:00Z"
            }
          ];
        } else if (bookId === 2) {
          return [
            {
              id: 201,
              bookId: 2,
              username: "dev_sinh_vien",
              rating: 5,
              comment: "Sách gối đầu giường của mọi lập trình viên. Đọc đi đọc lại vẫn thấy thấm!",
              createdAt: "2026-07-09T09:15:00Z"
            }
          ];
        }
        return [];
      }
      throw err;
    }
  },

  getAverageRating: async (bookId: number): Promise<number | null> => {
    try {
      const res = await fetch(`${API_URL}/reviews/book/${bookId}/average`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch average rating");
      return await res.json();
    } catch (err: any) {
      if (err instanceof TypeError || err.message === "Failed to fetch") {
        console.warn("Backend offline. Returning mock average rating.");
        if (bookId === 1) return 4.5;
        if (bookId === 2) return 5.0;
        return 0;
      }
      throw err;
    }
  }
};
