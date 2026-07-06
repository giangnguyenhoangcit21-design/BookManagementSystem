"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Library, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>BookFlow</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Đăng nhập</Button>
          </Link>
          <Link href="/register">
            <Button>Đăng ký</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-950">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Quản lý thư viện <span className="text-blue-600">thông minh</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Nền tảng giúp bạn quản lý mượn trả sách, theo dõi lịch sử đọc và khám phá hàng ngàn tựa sách mới mỗi ngày.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                Bắt đầu ngay
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">Khám phá sách</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full text-left">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <Library className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kho sách khổng lồ</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Hàng nghìn tựa sách được cập nhật liên tục đáp ứng mọi nhu cầu.</p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <TrendingUp className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Theo dõi tiến độ</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Quản lý sách đang mượn, đã trả và lưu trữ mục yêu thích của bạn.</p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <BookOpen className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Giao diện hiện đại</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Thiết kế tối ưu, sang trọng và dễ sử dụng trên mọi thiết bị.</p>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-zinc-500 border-t border-zinc-200 dark:border-zinc-800">
        &copy; 2026 BookFlow. All rights reserved.
      </footer>
    </div>
  );
}
