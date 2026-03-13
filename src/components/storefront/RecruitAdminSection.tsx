"use client";

import { useState } from "react";
import Image from "next/image";
import { UserPlus, Zap, TrendingUp, ShieldCheck, Users, ChevronDown } from "lucide-react";
import facebookIcon from "@/assets/icons/facebook.webp";
import zaloIcon from "@/assets/icons/zalo.png";

const VS_ITEMS = [
  {
    icon: Zap,
    color: "indigo",
    title: "Bán nhanh hơn rõ rệt",
    web: "Acc được đăng trực tiếp lên web — khách tự tìm đến, không cần spam group",
    fb: "Đăng group Facebook, bài trôi nhanh, phải repost liên tục",
  },
  {
    icon: TrendingUp,
    color: "emerald",
    title: "Giữ 100% tiền lời",
    web: "Toàn bộ tiền lãi từ mỗi acc bán được thuộc về bạn — không chia hoa hồng",
    fb: "Tự quản lý giá, dễ bị khách/buôn ép giá hoặc so sánh liên tục",
  },
  {
    icon: ShieldCheck,
    color: "amber",
    title: "Hệ thống quản lý riêng",
    web: "Có trang quản lý admin riêng: đăng, sửa, theo dõi trạng thái bán — mọi thứ ở một nơi",
    fb: "Quản lý thủ công qua tin nhắn & comment, dễ nhầm lẫn, sót đơn",
  },
  {
    icon: Users,
    color: "purple",
    title: "Tiếp cận đúng khách hàng",
    web: "Khách vào web đã có nhu cầu mua acc — tỉ lệ chốt cao hơn",
    fb: "Đối tượng group hỗn tạp, nhiều người xem nhưng ít người mua thật",
  },
];

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-500", badge: "bg-indigo-100 text-indigo-700" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  amber: { bg: "bg-amber-50", icon: "text-amber-500", badge: "bg-amber-100 text-amber-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", badge: "bg-purple-100 text-purple-700" },
};

export function RecruitAdminSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50">
      {/* Collapse trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full"
        aria-expanded={open}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <UserPlus className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-slate-800">
                Tuyển Cộng Tác Viên Đăng Bán Acc
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                Đang tuyển
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Description */}
          <p className="mb-8 max-w-2xl text-sm text-slate-500 sm:text-base">
            Bạn đang tự bán acc eFootball trên Facebook group nhưng mất quá nhiều thời gian? Hãy thử
            cách khác — đăng bán qua{" "}
            <span className="font-semibold text-slate-700">THC eFootball Shop</span> và tập trung
            vào việc kiếm tiền thay vì repost bài mỗi ngày.
          </p>

          {/* VS comparison cards */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            {VS_ITEMS.map(({ icon: Icon, color, title, web, fb }) => {
              const c = colorMap[color];
              return (
                <div
                  key={title}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
                      <Icon className={`h-4 w-4 ${c.icon}`} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                  </div>
                  <div className="divide-y divide-slate-50 px-5">
                    <div className="flex items-start gap-3 py-3.5">
                      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.badge}`}>
                        Web
                      </span>
                      <p className="text-sm text-slate-700">{web}</p>
                    </div>
                    <div className="flex items-start gap-3 py-3.5">
                      <span className="mt-0.5 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Group FB
                      </span>
                      <p className="text-sm text-slate-400">{fb}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-medium text-slate-700">
              Quan tâm? Nhắn ngay để được hướng dẫn tham gia:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://zalo.me/0969347283"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-full border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-100 hover:scale-105 active:scale-95"
              >
                <Image src={zaloIcon} alt="Zalo" className="h-5 w-5 object-contain" />
                Nhắn Zalo: 0969 347 283
              </a>
              <a
                href="https://www.facebook.com/share/1B7kgySoVd/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
              >
                <Image src={facebookIcon} alt="Facebook" className="h-5 w-5 object-contain" />
                Nhắn Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
