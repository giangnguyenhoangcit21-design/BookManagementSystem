"use client";

import Link from "next/link";
import { BookOpen, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <span>BookFlow</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/borrows">
              <Button variant="ghost" className="flex gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Lịch sử mượn</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="flex gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.name}</span>
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={logout} title="Đăng xuất">
              <LogOut className="w-4 h-4 text-red-500" />
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
