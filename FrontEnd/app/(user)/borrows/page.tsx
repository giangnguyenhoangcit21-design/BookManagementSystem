"use client";

import { useEffect, useState } from "react";
import { api, BorrowRecordResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserBorrowsPage() {
  const [borrows, setBorrows] = useState<BorrowRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrows = async () => {
      try {
        const data = await api.getUserBorrows();
        setBorrows(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBorrows();
  }, []);

  if (loading) return <div className="py-20 text-center">Đang tải dữ liệu...</div>;

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử mượn sách</h1>
        <p className="text-zinc-500 mt-1">Quản lý các sách bạn đã yêu cầu mượn</p>
      </div>

      {borrows.length === 0 ? (
        <Card className="py-12 text-center text-zinc-500">
          Bạn chưa có lịch sử mượn sách nào.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrows.map(borrow => (
            <Card key={borrow.id} className="overflow-hidden">
              <CardHeader className="pb-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg line-clamp-1">{borrow.bookTitle}</CardTitle>
                  {getStatusBadge(borrow.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ngày yêu cầu:</span>
                  <span className="font-medium">{formatDate(borrow.requestDate)}</span>
                </div>
                {borrow.status === 'APPROVED' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Ngày mượn:</span>
                      <span className="font-medium">{formatDate(borrow.borrowDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Hạn trả:</span>
                      <span className={`font-medium ${borrow.isOverdue ? 'text-red-500 font-bold' : ''}`}>
                        {formatDate(borrow.dueDate)}
                        {borrow.isOverdue && " (Quá hạn)"}
                      </span>
                    </div>
                  </>
                )}
                {borrow.status === 'RETURNED' && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Ngày trả:</span>
                    <span className="font-medium">{formatDate(borrow.returnDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
