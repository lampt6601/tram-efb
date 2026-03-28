"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
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
  TrendingUp,
  ChevronDown,
  Check,
  X,
  DollarSign,
  Trophy,
} from "lucide-react";
import { Suspense } from "react";

interface SellerRank {
  name: string;
  soldCount: number;
}

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

const comparisonRows = [
  {
    feature: "Bài đăng bán acc",
    thc: "Luôn hiển thị trên web, không bị trôi",
    fb: "Trôi nhanh trong group, phải đăng lại liên tục",
  },
  {
    feature: "Khách hàng",
    thc: "Chất lượng cao — liên hệ Zalo là đã xác định mua",
    fb: "Nhiều người hỏi giá rồi biến, bị ép giá",
  },
  {
    feature: "Thời gian bán",
    thc: "Đăng 1 lần, tự động hiển thị đến khi bán xong",
    fb: "Tốn thời gian đăng bài, trả lời comment, nhắn tin",
  },
  {
    feature: "Bị ép giá",
    thc: "Giá niêm yết rõ ràng, khách liên hệ khi chấp nhận giá",
    fb: "Thường xuyên bị trả giá, ép giá trong comment",
  },
  {
    feature: "Tập trung công việc",
    thc: "Chỉ cần thu mua acc, shop lo phần bán",
    fb: "Vừa thu mua, vừa đăng bài, vừa chăm khách",
  },
  {
    feature: "Hỗ trợ định giá",
    thc: "Admin hỗ trợ tư vấn giá phù hợp",
    fb: "Tự định giá, dễ bán lỗ hoặc bán quá cao",
  },
  {
    feature: "Theo dõi doanh thu",
    thc: "Dashboard tự động tính lợi nhuận, thống kê",
    fb: "Tự ghi chép, dễ quên, không rõ lời lỗ",
  },
  {
    feature: "Uy tín với khách",
    thc: "Có thương hiệu shop, 174+ giao dịch thành công",
    fb: "Phải tự build trust, khách dễ nghi lừa đảo",
  },
];

const faqs = [
  {
    q: "Tôi cần bỏ vốn bao nhiêu?",
    a: "Không cần vốn lớn. Bạn chỉ cần bỏ tiền thu mua acc (thường từ 20K–200K/acc). Bán được mới tính lợi nhuận.",
  },
  {
    q: "Hoa hồng / phí nền tảng là bao nhiêu?",
    a: "Hiện tại THC không thu phí nền tảng hay hoa hồng. 100% lợi nhuận thuộc về bạn.",
  },
  {
    q: "Có bị giới hạn số acc đăng bán không?",
    a: "Không giới hạn. Bạn đăng càng nhiều acc, khả năng bán càng cao.",
  },
  {
    q: "Tôi chưa có kinh nghiệm bán acc, có được không?",
    a: "Hoàn toàn được! Shop có hướng dẫn chi tiết, và admin sẵn sàng hỗ trợ bạn định giá và bán acc từ bước đầu tiên.",
  },
  {
    q: "Làm sao để thu mua acc?",
    a: "Bạn có thể thu mua từ các group Facebook, Zalo, hoặc từ bạn bè. Dashboard sẽ hiện loại acc khách đang tìm để bạn biết nên thu mua gì.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-slate-600 dark:text-slate-400">{a}</p>
      )}
    </div>
  );
}

function TopSellersSection({ sellers }: { sellers: SellerRank[] }) {
  if (sellers.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="mt-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 sm:p-6 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-yellow-500/5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h2 className="text-base font-bold text-amber-800 dark:text-amber-300">
          Top Người Bán Tháng Này
        </h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sellers.map((s, i) => (
          <div
            key={s.name}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              i === 0
                ? "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
                : "border-amber-100 bg-white/70 dark:border-amber-500/10 dark:bg-slate-800/50"
            }`}
          >
            <span className="w-7 text-center text-lg">
              {i < 3 ? medals[i] : `${i + 1}.`}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                {s.name}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {s.soldCount} acc đã bán
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-amber-600/70 dark:text-amber-400/60">
        * Số liệu thực tế của người bán trong tháng hiện tại
      </p>
    </div>
  );
}

function SellerApplyFormInner({ leaderboard }: { leaderboard: SellerRank[] }) {
  const searchParams = useSearchParams();
  const referrer = searchParams.get("ref") ?? "";

  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zaloPhone, setZaloPhone] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (!zaloPhone.trim()) {
      setError("Vui lòng nhập số điện thoại Zalo.");
      return;
    }

    startTransition(async () => {
      const result = await submitSellerApplication({
        fullName,
        email,
        password,
        zaloLink: `https://zalo.me/${zaloPhone.trim()}`,
        facebookLink: facebookLink || undefined,
        reason: reason || undefined,
        referredBy: referrer || undefined,
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
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Đăng ký thành công!
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
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
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-500/20">
              <UserPlus className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Mở Gian Hàng Bán Acc
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Mở gian hàng riêng, tự đăng và bán acc eFootball trên THC Shop
            </p>
          </div>

          {/* Income example */}
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 sm:p-6 dark:border-emerald-500/20 dark:from-emerald-500/5 dark:to-teal-500/5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                Thu nhập mẫu
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/70 p-4 text-center dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Mới bắt đầu</p>
                <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  300K–500K
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">~10 acc/tháng</p>
              </div>
              <div className="rounded-xl bg-white/70 p-4 text-center ring-2 ring-emerald-300 dark:bg-slate-800/50 dark:ring-emerald-500/30">
                <p className="text-xs text-slate-500 dark:text-slate-400">Trung bình</p>
                <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  500K–1.5M
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">~20 acc/tháng</p>
              </div>
              <div className="rounded-xl bg-white/70 p-4 text-center dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Top seller</p>
                <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  2M–5M+
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">40+ acc/tháng</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-emerald-600/70 dark:text-emerald-400/60">
              * Lợi nhuận thực tế tuỳ thuộc vào loại acc và giá thu mua. Không thu phí nền tảng.
            </p>
          </div>

          {/* Top sellers leaderboard */}
          <TopSellersSection sellers={leaderboard} />

          {/* Benefits grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800"
              >
                <b.icon className="mx-auto mb-2 h-6 w-6 text-indigo-500" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {b.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Bán trên THC Shop vs Đăng Facebook
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tại sao chọn THC thay vì tự đăng group Facebook?
              </p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {comparisonRows.map((row) => (
                <div key={row.feature} className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {row.feature}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="flex gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">THC Shop</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{row.thc}</p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-lg border border-red-100 bg-red-50/30 px-3 py-2.5 dark:border-red-500/10 dark:bg-red-500/5">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">Facebook</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{row.fb}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-800"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Thông tin đăng ký
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Điền thông tin bên dưới, chúng tôi sẽ liên hệ trong 24h
              </p>

              {error && (
                <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                  {error}
                </div>
              )}

              <div className="mt-5 space-y-4">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Họ tên <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="Nguyễn Văn A"
                    className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                    className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  />
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Email này sẽ được dùng để đăng nhập quản trị
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Mật khẩu <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Tối thiểu 8 ký tự"
                    className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  />
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Mật khẩu để đăng nhập vào trang quản trị gian hàng
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="zalo"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Số điện thoại Zalo <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="zalo"
                    type="tel"
                    value={zaloPhone}
                    onChange={(e) => setZaloPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                    maxLength={15}
                    placeholder="0969347283"
                    className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  />
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Khách hàng sẽ liên hệ bạn qua số Zalo này để giao dịch
                  </p>
                  {zaloPhone.trim() && (
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      Link Zalo: <span className="font-medium text-indigo-500 dark:text-indigo-400">https://zalo.me/{zaloPhone.trim()}</span>
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="facebook"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Link Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    maxLength={200}
                    placeholder="https://facebook.com/..."
                    className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="reason"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Lý do muốn tham gia
                  </Label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Bạn đã có kinh nghiệm bán acc chưa? Kể thêm về bạn..."
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 resize-none md:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
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

            {/* FAQ */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Câu hỏi thường gặp
              </h2>
              <div className="mt-4">
                {faqs.map((f) => (
                  <FAQItem key={f.q} q={f.q} a={f.a} />
                ))}
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 p-6 text-center text-white sm:p-8">
            <TrendingUp className="mx-auto mb-3 h-8 w-8 opacity-80" />
            <h2 className="text-lg font-bold">Còn thắc mắc?</h2>
            <p className="mt-1 text-sm text-white/80">
              Tham gia group tư vấn hoặc liên hệ trực tiếp
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href="https://zalo.me/g/a3v3dgaj4ugylmmnwk0u"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/30"
              >
                Group Tư Vấn Zalo
              </a>
              <a
                href="/api/contact/owner?type=zalo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-white/90"
              >
                Liên Hệ Zalo
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function SellerApplyForm({ leaderboard }: { leaderboard: SellerRank[] }) {
  return (
    <Suspense>
      <SellerApplyFormInner leaderboard={leaderboard} />
    </Suspense>
  );
}
