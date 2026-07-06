"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: "/admin/users", label: "Quản lý Người dùng", icon: Users },
    { href: "/admin/books", label: "Quản lý Sách", icon: BookOpen },
  ];

  if (!user || user.role !== 'admin') {
    return <div className="p-20 text-center">Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xl font-bold">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          <span>Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button variant="outline" className="w-full flex justify-start gap-2" onClick={logout}>
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
