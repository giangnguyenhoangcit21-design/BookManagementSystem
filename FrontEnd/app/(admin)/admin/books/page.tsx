"use client";

import { useEffect, useState } from "react";
import { Book, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({ id: "", title: "", author: "", price: 0, description: "" });

  const fetchBooks = () => {
    setLoading(true);
    api.getBooks().then(data => {
      setBooks(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: string) => {
    if(confirm("Bạn có chắc chắn muốn xóa sách này?")) {
      try {
        await api.deleteBook(id);
        fetchBooks();
      } catch (err: any) {
        alert(err.message || "Failed to delete");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.updateBook(formData.id, formData);
      } else {
        await api.createBook(formData);
      }
      setShowForm(false);
      setFormData({ id: "", title: "", author: "", price: 0, description: "" });
      fetchBooks();
    } catch (err: any) {
      alert(err.message || "Failed to save book");
    }
  };

  const handleEdit = (b: Book) => {
    setFormData({
      id: b.id,
      title: b.title,
      author: b.author,
      price: b.price || 0,
      description: b.description
    });
    setShowForm(true);
  };

  if (loading) return <div className="p-10">Đang tải...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Sách</h1>
        <Button onClick={() => {
          setFormData({ id: "", title: "", author: "", price: 0, description: "" });
          setShowForm(!showForm);
        }}>
          {showForm ? "Đóng" : "Thêm sách mới"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 mb-6">
          <h2 className="text-lg font-semibold mb-4">{formData.id ? "Cập nhật sách" : "Thêm sách mới"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tác giả</label>
              <Input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá (VND)</label>
              <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <Button type="submit">{formData.id ? "Cập nhật" : "Tạo mới"}</Button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 font-medium w-16">Bìa</th>
              <th className="px-6 py-3 font-medium">Tiêu đề</th>
              <th className="px-6 py-3 font-medium">Tác giả</th>
              <th className="px-6 py-3 font-medium">Giá</th>
              <th className="px-6 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                <td className="px-6 py-4">
                  <img src={b.coverImage} alt={b.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                </td>
                <td className="px-6 py-4 font-medium">{b.title}</td>
                <td className="px-6 py-4 text-zinc-500">{b.author}</td>
                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                  {b.price?.toLocaleString()} VND
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="text-blue-600 mr-2" onClick={() => handleEdit(b)}>Sửa</Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(b.id)}>Xóa</Button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-zinc-500">Chưa có dữ liệu sách.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
