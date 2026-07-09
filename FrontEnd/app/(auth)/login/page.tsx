"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Shield, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (usr: string, pwd: string) => {
    setUsername(usr);
    setPassword(pwd);
    setError("");
    setLoading(true);
    try {
      await login(usr, pwd);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <Link href="/">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </Link>
          </div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập tài khoản của bạn để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên đăng nhập (Username)</label>
              <Input
                type="text"
                placeholder="Ví dụ: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-zinc-950 text-zinc-500">Đăng nhập nhanh</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              className="w-full flex items-center justify-center gap-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400"
              onClick={() => handleQuickLogin("admin_thay_giao", "123456")}
              disabled={loading}
            >
              <Shield className="w-4.5 h-4.5" />
              <span>Admin</span>
            </Button>
            <Button
              variant="outline"
              type="button"
              className="w-full flex items-center justify-center gap-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-700 dark:text-blue-400"
              onClick={() => handleQuickLogin("dev_sinh_vien", "123456")}
              disabled={loading}
            >
              <User className="w-4.5 h-4.5" />
              <span>Sinh viên</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
