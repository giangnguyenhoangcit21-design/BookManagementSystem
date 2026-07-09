"use client";

import { useEffect, useState } from "react";
import { Book, api, ReviewResponse } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Heart, Search, Star, MessageSquare, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [avgRatings, setAvgRatings] = useState<Record<string, number>>({});
  
  // Advanced Filter & Sort State
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("newest");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [pageSize, setPageSize] = useState(8);
  const [activeBorrows, setActiveBorrows] = useState<Record<string, string>>({});

  // Modal State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [selectedBookRating, setSelectedBookRating] = useState<number | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, favData] = await Promise.all([
          api.getBooks(),
          user ? api.getFavorites(user.id) : Promise.resolve([])
        ]);
        setBooks(booksData);
        setFavorites(favData.map(b => b.id));

        // Fetch active borrows to display status badges
        if (user) {
          try {
            const borrowsData = await api.getUserBorrows();
            const activeMap: Record<string, string> = {};
            borrowsData.forEach(record => {
              if (record.status === 'PENDING' || record.status === 'APPROVED') {
                activeMap[record.bookId.toString()] = record.status;
              }
            });
            setActiveBorrows(activeMap);
          } catch (e) {
            console.error("Error fetching user borrows for badges", e);
          }
        }

        // Fetch average ratings for all books
        const ratingsMap: Record<string, number> = {};
        await Promise.all(
          booksData.map(async (book) => {
            try {
              const avg = await api.getAverageRating(Number(book.id));
              ratingsMap[book.id] = avg || 0;
            } catch (e) {
              console.error("Error fetching rating for book", book.id, e);
            }
          })
        );
        setAvgRatings(ratingsMap);
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
      
      // Update active borrows map immediately
      setActiveBorrows(prev => ({
        ...prev,
        [bookId]: 'PENDING'
      }));
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

  const openBookDetails = async (book: Book) => {
    setSelectedBook(book);
    setReviewsLoading(true);
    setNewRating(5);
    setNewComment("");
    try {
      const [reviewsData, avgRating] = await Promise.all([
        api.getReviews(Number(book.id)),
        api.getAverageRating(Number(book.id))
      ]);
      setReviews(reviewsData);
      setSelectedBookRating(avgRating);
    } catch (e) {
      console.error("Error opening book details", e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBook) return;
    setSubmittingReview(true);
    try {
      await api.addReview(Number(selectedBook.id), newRating, newComment);
      
      // Reload reviews and average rating
      const [reviewsData, avgRating] = await Promise.all([
        api.getReviews(Number(selectedBook.id)),
        api.getAverageRating(Number(selectedBook.id))
      ]);
      setReviews(reviewsData);
      setSelectedBookRating(avgRating);

      // Update avgRatings map for dashboard
      if (avgRating !== null) {
        setAvgRatings(prev => ({
          ...prev,
          [selectedBook.id]: avgRating
        }));
      }

      setNewComment("");
      alert("Cảm ơn bạn đã gửi đánh giá!");
    } catch (err: any) {
      alert(err.message || "Không thể gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // -------------------------
  // Filtering & Sorting Logic
  // -------------------------
  
  // 1. Filter by Search Term
  let processedBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // 2. Filter by Category
  if (activeCategory !== "Tất cả") {
    processedBooks = processedBooks.filter(b => b.category === activeCategory);
  }

  // 3. Filter by Availability
  if (availableOnly) {
    processedBooks = processedBooks.filter(b => b.available);
  }

  // 4. Filter by Favorites
  if (favoritesOnly) {
    processedBooks = processedBooks.filter(b => favorites.includes(b.id));
  }

  // 5. Sort Books
  processedBooks = [...processedBooks].sort((a, b) => {
    if (sortBy === "price-asc") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === "price-desc") {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortBy === "rating-desc") {
      const ratingA = avgRatings[a.id] || 0;
      const ratingB = avgRatings[b.id] || 0;
      return ratingB - ratingA;
    }
    // "newest": Sort by ID descending (larger ID = newer)
    return parseInt(b.id) - parseInt(a.id);
  });

  // 6. Paginate (Load More)
  const hasMore = processedBooks.length > pageSize;
  const paginatedBooks = processedBooks.slice(0, pageSize);

  if (loading) return <div className="py-20 text-center text-sm font-semibold">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thư viện sách</h1>
          <p className="text-zinc-500 mt-1">Khám phá các đầu sách mới nhất</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Tìm kiếm sách..." 
            className="pl-9 bg-white dark:bg-zinc-950"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageSize(8); // Reset page size on search
            }}
          />
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none select-none">
        {["Tất cả", "Lập trình", "Kinh tế", "Kỹ năng", "Khác"].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setPageSize(8); // Reset page size
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl select-none">
        {/* Checkbox filters */}
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input 
              type="checkbox" 
              checked={availableOnly}
              onChange={(e) => {
                setAvailableOnly(e.target.checked);
                setPageSize(8);
              }}
              className="w-4 h-4 text-blue-600 border-zinc-300 dark:border-zinc-700 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-zinc-700 dark:text-zinc-300">Chỉ hiển thị sách sẵn có</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input 
              type="checkbox" 
              checked={favoritesOnly}
              onChange={(e) => {
                setFavoritesOnly(e.target.checked);
                setPageSize(8);
              }}
              className="w-4 h-4 text-blue-600 border-zinc-300 dark:border-zinc-700 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-zinc-700 dark:text-zinc-300">Chỉ xem sách yêu thích</span>
          </label>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold text-zinc-500 shrink-0">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPageSize(8);
            }}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating-desc">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Sách Grid */}
      {paginatedBooks.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl text-zinc-400 dark:text-zinc-600 text-sm">
          Không tìm thấy cuốn sách nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedBooks.map(book => {
            const isFav = favorites.includes(book.id);
            return (
              <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    onClick={() => openBookDetails(book)}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />
                  
                  {/* Huy hiệu trạng thái mượn của user */}
                  {activeBorrows[book.id] && (
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold shadow-md select-none ${
                      activeBorrows[book.id] === 'APPROVED' 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                        : 'bg-amber-500 text-white shadow-amber-500/20'
                    }`}>
                      {activeBorrows[book.id] === 'APPROVED' ? 'Đang mượn' : 'Chờ duyệt'}
                    </div>
                  )}

                  <button 
                    onClick={() => toggleFavorite(book.id)}
                    className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 transition-colors z-10"
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-zinc-900 dark:text-zinc-50'}`} />
                  </button>
                </div>
                <div 
                  onClick={() => openBookDetails(book)} 
                  className="p-4 pb-2 flex-1 cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold line-clamp-1 flex-1 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{avgRatings[book.id] ? avgRatings[book.id].toFixed(1) : "0.0"}</span>
                    </div>
                  </div>
                  <CardDescription className="text-xs">{book.author}</CardDescription>
                  <div className="mt-2 font-semibold text-blue-600 dark:text-blue-400 text-sm">
                    {book.price ? `${book.price.toLocaleString()} VND` : 'Miễn phí'}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-2">
                    {book.description}
                  </p>
                </div>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    disabled={!book.available}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBorrow(book.id);
                    }}
                  >
                    {book.available ? 'Yêu cầu mượn' : 'Đã hết'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination - Xem thêm */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => setPageSize(prev => prev + 8)}
            variant="outline"
            className="px-8 border-zinc-200 dark:border-zinc-800 font-semibold cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Xem thêm sách
          </Button>
        </div>
      )}

      {/* Book Details & Review Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
            
            {/* Left side: Book Cover & Quick actions */}
            <div className="w-full md:w-2/5 bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800">
              <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-lg mb-6">
                <img 
                  src={selectedBook.coverImage} 
                  alt={selectedBook.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                disabled={!selectedBook.available}
                onClick={() => handleBorrow(selectedBook.id)}
              >
                {selectedBook.available ? 'Yêu cầu mượn ngay' : 'Đã hết sách'}
              </Button>
              <button 
                onClick={() => {
                  setSelectedBook(null);
                  setReviews([]);
                }}
                className="mt-4 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 cursor-pointer"
              >
                Đóng chi tiết
              </button>
            </div>

            {/* Right side: Info, Reviews & Review Form */}
            <div className="w-full md:w-3/5 p-6 flex flex-col overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{selectedBook.title}</h2>
                  <p className="text-zinc-500 text-sm">Tác giả: {selectedBook.author}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedBook(null);
                    setReviews([]);
                  }}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable details and reviews container */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-thin">
                
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 text-xs uppercase tracking-wider">Mô tả sách</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                    {selectedBook.description || "Chưa có mô tả cụ thể cho cuốn sách này."}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-100 dark:border-zinc-800"></div>

                {/* Rating Overview */}
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span>Đánh giá của độc giả</span>
                  </h3>
                  
                  <div className="flex items-center gap-6 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
                        {selectedBookRating ? selectedBookRating.toFixed(1) : "0.0"}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">trên 5 sao</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-4 h-4 ${s <= Math.round(selectedBookRating || 0) ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                          ({reviews.length} lượt đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Review Form */}
                <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 p-4 rounded-xl space-y-3">
                  <h4 className="font-semibold text-xs text-blue-900 dark:text-blue-300">Gửi đánh giá của bạn</h4>
                  {user ? (
                    <div className="space-y-3">
                      {/* Rating selection */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-500">Xếp hạng:</span>
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setNewRating(s)}
                              className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${s <= newRating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Comment text */}
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Nhập nhận xét của bạn tại đây..." 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 bg-white dark:bg-zinc-950"
                        />
                        <Button 
                          onClick={handleSubmitReview}
                          disabled={submittingReview || !newComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700 shrink-0 flex gap-1.5"
                        >
                          {submittingReview ? (
                            "Gửi..."
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Gửi</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Bạn cần{" "}
                      <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                        Đăng nhập
                      </Link>{" "}
                      để gửi đánh giá cho cuốn sách này.
                    </p>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Nhận xét chi tiết ({reviews.length})</span>
                  </h3>
                  
                  {reviewsLoading ? (
                    <div className="text-center py-4 text-sm text-zinc-500">Đang tải nhận xét...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-xl text-zinc-400 dark:text-zinc-600 text-sm">
                      Chưa có nhận xét nào. Hãy là người đầu tiên đánh giá!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((r) => (
                        <div key={r.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-b-0">
                          <div className="flex justify-between items-start text-xs text-zinc-500 mb-1">
                            <span className="font-bold text-zinc-800 dark:text-zinc-300">{r.username}</span>
                            <span>{new Date(r.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex text-amber-500 mb-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-current' : 'text-zinc-200 dark:text-zinc-800'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {r.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
