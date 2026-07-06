"use client";

import { useEffect, useState } from "react";
import { api, Book, BorrowRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState<BorrowRequest[]>([]);
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksDict, setBooksDict] = useState<Record<string, Book>>({});
  const [activeTab, setActiveTab] = useState<'borrows' | 'favorites'>('borrows');

  const fetchData = async () => {
    if (!user) return;
    try {
      const [borrowsData, favData, allBooks] = await Promise.all([
        api.getUserBorrows(user.id),
        api.getFavorites(user.id),
        api.getBooks()
      ]);
      setBorrows(borrowsData);
      setFavorites(favData);
      
      const dict: Record<string, Book> = {};
      allBooks.forEach(b => dict[b.id] = b);
      setBooksDict(dict);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCancel = async (borrowId: string) => {
    if(confirm("Bạn có chắc chắn muốn hủy yêu cầu này?")) {
      await api.cancelBorrow(borrowId);
      fetchData();
    }
  };

  const handleReturn = async (borrowId: string) => {
    if(confirm("Xác nhận trả sách?")) {
      await api.returnBook(borrowId);
      fetchData();
    }
  };

  if (!user) return <div className="py-20 text-center">Vui lòng đăng nhập</div>;
  if (loading) return <div className="py-20 text-center">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b dark:border-zinc-800">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex border-b dark:border-zinc-800">
            <button 
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'borrows' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}
              onClick={() => setActiveTab('borrows')}
            >
              Lịch sử mượn sách
            </button>
            <button 
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'favorites' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}
              onClick={() => setActiveTab('favorites')}
            >
              Sách yêu thích
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'borrows' && (
              <div className="space-y-4">
                {borrows.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">Bạn chưa mượn cuốn sách nào.</p>
                ) : (
                  borrows.map(borrow => {
                    const book = booksDict[borrow.bookId];
                    if (!book) return null;
                    return (
                      <div key={borrow.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <img src={book.coverImage} alt={book.title} className="w-16 h-24 object-cover rounded-md" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{book.title}</h4>
                          <p className="text-sm text-zinc-500">Ngày yêu cầu: {new Date(borrow.borrowDate).toLocaleDateString()}</p>
                          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {borrow.status === 'pending' && 'Đang chờ duyệt'}
                            {borrow.status === 'approved' && 'Đang mượn'}
                            {borrow.status === 'returned' && 'Đã trả'}
                            {borrow.status === 'cancelled' && 'Đã hủy'}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 justify-center">
                          {borrow.status === 'pending' && (
                            <Button variant="danger" size="sm" onClick={() => handleCancel(borrow.id)}>Hủy yêu cầu</Button>
                          )}
                          {borrow.status === 'approved' && (
                            <Button variant="outline" size="sm" onClick={() => handleReturn(borrow.id)}>Trả sách</Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favorites.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8 col-span-full">Danh sách yêu thích trống.</p>
                ) : (
                  favorites.map(book => (
                    <div key={book.id} className="flex gap-4 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded-md" />
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">{book.title}</h4>
                        <p className="text-xs text-zinc-500 mt-1">{book.author}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
