"use client";

import { useEffect, useState } from "react";
import { Book, api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, favData] = await Promise.all([
          api.getBooks(),
          user ? api.getFavorites(user.id) : Promise.resolve([])
        ]);
        setBooks(booksData);
        setFavorites(favData.map(b => b.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleBorrow = async (bookId: string) => {
    if (!user) return alert("Vui lòng đăng nhập!");
    try {
      await api.borrowBook(bookId);
      alert("Đã gửi yêu cầu mượn sách!");
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra.");
    }
  };

  const toggleFavorite = async (bookId: string) => {
    if (!user) return alert("Vui lòng đăng nhập!");
    try {
      await api.toggleFavorite(user.id, bookId);
      setFavorites(prev => 
        prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="py-20 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thư viện sách</h1>
          <p className="text-zinc-500 mt-1">Khám phá các đầu sách mới nhất</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Tìm kiếm sách..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map(book => {
          const isFav = favorites.includes(book.id);
          return (
            <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img 
                  src={book.coverImage} 
                  alt={book.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={() => toggleFavorite(book.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 transition-colors`}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-zinc-900 dark:text-zinc-50'}`} />
                </button>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                <CardDescription>{book.author}</CardDescription>
                <div className="mt-1 font-semibold text-blue-600 dark:text-blue-400">
                  {book.price ? `${book.price.toLocaleString()} VND` : 'Miễn phí'}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {book.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  disabled={!book.available}
                  onClick={() => handleBorrow(book.id)}
                >
                  {book.available ? 'Yêu cầu mượn' : 'Đã hết'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
