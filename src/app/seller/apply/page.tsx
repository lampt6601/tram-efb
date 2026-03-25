"use client";

import { useState, useTransition } from "react";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitSellerApplication } from "@/app/actions/seller-application-actions";
import {
  UserPlus,
  CheckCircle2,
  Store,
  Zap,
  Shield,
  HeadphonesIcon,
} from "lucide-react";

const benefits = [
  {
    icon: Store,
    title: "Gian hàng riêng",
    desc: "Tự đăng và quản lý acc trên nền tảng uy tín",
  },
  {
    icon: Zap,
    title: "Tiếp cận khách hàng",
    desc: "Hàng trăm người mua truy cập mỗi ngày",
  },
  {
    icon: Shield,
    title: "Giao dịch an toàn",
    desc: "Quy trình minh bạch, được kiểm duyệt",
  },
  {
    icon: HeadphonesIcon,
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ admin luôn sẵn sàng hỗ trợ",
  },
];

export default function SellerApplyPage() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zaloLink, setZaloLink] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await submitSellerApplication({
        fullName,
        email,
        phone: phone || undefined,
        zaloLink: zaloLink || undefined,
        reason: reason || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Đăng ký thành công!
            </h1>
            <p className="mt-3 text-slate-600">
              Đơn đăng ký của bạn đã được gửi. Chúng tôi sẽ xem xét và liên hệ
              qua email hoặc Zalo sớm nhất có thể.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Về trang chủ
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
              <UserPlus className="h-7 w-7 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Trở Thành Cộng Tác Viên Bán Hàng
            </h1>
            <p className="mt-2 text-slate-600">
              Đăng ký để bắt đầu đăng bán tài khoản eFootball trên THC Shop
            </p>
          </div>

          {/* Benefits grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-slate-200 bg-white p-4 text-center"
              >
                <b.icon className="mx-auto mb-2 h-6 w-6 text-indigo-500" />
                <p className="text-sm font-semibold text-slate-800">{b.title}</p>
                <p className="mt-1 text-xs text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Thông tin đăng ký
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Điền thông tin bên dưới, chúng tôi sẽ liên hệ trong 24h
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-slate-700">
                  Họ tên <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Nguyễn Văn A"
                  className="mt-1.5 rounded-lg border-slate-200"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-700">
                  Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="mt-1.5 rounded-lg border-slate-200"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Email này sẽ được dùng để đăng nhập quản trị
                </p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-slate-700">
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  placeholder="0969xxxxxx"
                  className="mt-1.5 rounded-lg border-slate-200"
                />
              </div>

              <div>
                <Label htmlFor="zalo" className="text-slate-700">
                  Link Zalo
                </Label>
                <Input
                  id="zalo"
                  value={zaloLink}
                  onChange={(e) => setZaloLink(e.target.value)}
                  maxLength={200}
                  placeholder="https://zalo.me/..."
                  className="mt-1.5 rounded-lg border-slate-200"
                />
              </div>

              <div>
                <Label htmlFor="reason" className="text-slate-700">
                  Lý do muốn tham gia
                </Label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Bạn đã có kinh nghiệm bán acc chưa? Kể thêm về bạn..."
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="mt-6 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {isPending ? "Đang gửi..." : "Gửi đơn đăng ký"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
