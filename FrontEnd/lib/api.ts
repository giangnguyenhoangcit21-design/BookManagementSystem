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
  status: 'pending' | 'approved' | 'returned' | 'cancelled';
  borrowDate: string;
  returnDate?: string;
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
  },

  register: async (username: string, password?: string, role: string = 'user'): Promise<any> => {
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
  },
  
  // Books (Real Backend CRUD)
  getBooks: async (): Promise<Book[]> => {
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
  },
  
  createBook: async (book: Omit<Book, 'id'>): Promise<Book> => {
    const payload = {
      title: book.title,
      author: book.author,
      price: book.price || 0,
      description: book.description
    };
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
      price: b.price
    };
  },
  
  updateBook: async (id: string, updates: Partial<Book>): Promise<Book> => {
    const payload = {
      title: updates.title,
      author: updates.author,
      price: updates.price,
      description: updates.description
    };
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
  },
  
  deleteBook: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/books/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete book");
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
  
  borrowBook: async (userId: string, bookId: string): Promise<BorrowRequest> => {
    await new Promise(r => setTimeout(r, 300));
    return {
      id: Date.now().toString(),
      userId,
      bookId,
      status: 'pending',
      borrowDate: new Date().toISOString()
    };
  },
  
  cancelBorrow: async (borrowId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 300));
  },

  returnBook: async (borrowId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 300));
  },

  getUserBorrows: async (userId: string): Promise<BorrowRequest[]> => {
    await new Promise(r => setTimeout(r, 300));
    return []; // Return empty for mock
  },

  getFavorites: async (userId: string): Promise<Book[]> => {
    await new Promise(r => setTimeout(r, 300));
    return [];
  },

  toggleFavorite: async (userId: string, bookId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 300));
  }
};
