"use client";

import { useEffect, useState } from "react";
import { api, BorrowRecordResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminBorrowsPage() {
  const [borrows, setBorrows] = useState<BorrowRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const data = await api.getAllBorrows();
      setBorrows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.approveBorrow(id.toString());
      fetchBorrows();
    } catch (err: any) {
      alert(err.message || "Failed to approve");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectBorrow(id.toString());
      fetchBorrows();
    } catch (err: any) {
      alert(err.message || "Failed to reject");
    }
  };

  const handleReturn = async (id: number) => {
    try {
      await api.returnBook(id.toString());
      fetchBorrows();
    } catch (err: any) {
      alert(err.message || "Failed to return");
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "px-2 py-1 text-xs font-semibold rounded-md border";
    switch (status) {
      case 'PENDING': return <span className={`${baseClass} bg-yellow-50 text-yellow-700 border-yellow-200`}>Chờ duyệt</span>;
      case 'APPROVED': return <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>Được chấp nhận</span>;
      case 'REJECTED': return <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Từ chối</span>;
      case 'RETURNED': return <span className={`${baseClass} bg-zinc-50 text-zinc-700 border-zinc-200`}>Đã trả</span>;
      default: return <span className={`${baseClass} bg-zinc-100 text-zinc-800`}>{status}</span>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Mượn Sách</h1>
        <p className="text-zinc-500 mt-1">Quản lý yêu cầu mượn trả sách của tất cả người dùng</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Tên sách</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày yêu cầu</th>
                  <th className="px-6 py-4">Ngày mượn / Hạn trả</th>
                  <th className="px-6 py-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : borrows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                      Chưa có yêu cầu mượn sách nào.
                    </td>
                  </tr>
                ) : borrows.map((borrow) => (
                  <tr key={borrow.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 font-medium">#{borrow.id}</td>
                    <td className="px-6 py-4">{borrow.username}</td>
                    <td className="px-6 py-4 font-medium">{borrow.bookTitle}</td>
                    <td className="px-6 py-4">{getStatusBadge(borrow.status)}</td>
                    <td className="px-6 py-4">{formatDate(borrow.requestDate)}</td>
                    <td className="px-6 py-4">
                      {borrow.status === 'APPROVED' ? (
                        <div className="flex flex-col space-y-1">
                          <span>Mượn: {formatDate(borrow.borrowDate)}</span>
                          <span className={`font-medium ${borrow.isOverdue ? 'text-red-500 font-bold' : ''}`}>
                            Hạn: {formatDate(borrow.dueDate)}
                            {borrow.isOverdue && " (Quá hạn)"}
                          </span>
                        </div>
                      ) : borrow.status === 'RETURNED' ? (
                        <span>Trả: {formatDate(borrow.returnDate)}</span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {borrow.status === 'PENDING' && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(borrow.id)} className="bg-green-600 hover:bg-green-700 text-white">Duyệt</Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(borrow.id)}>Từ chối</Button>
                          </>
                        )}
                        {borrow.status === 'APPROVED' && (
                          <Button size="sm" onClick={() => handleReturn(borrow.id)}>Đã trả</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
