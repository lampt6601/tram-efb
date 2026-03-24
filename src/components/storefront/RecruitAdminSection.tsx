"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UserPlus, Store, Upload, ShieldCheck, ChevronDown } from "lucide-react";
import facebookIcon from "@/assets/icons/facebook.webp";
import zaloIcon from "@/assets/icons/zalo.png";

const STEPS = [
  {
    step: 1,
    icon: Store,
    color: "indigo",
    title: "Mở Gian Hàng",
    description:
      "Nhận tài khoản quản trị (Admin) riêng biệt, miễn phí 100%.",
  },
  {
    step: 2,
    icon: Upload,
    color: "emerald",
    title: "Tự Do Đăng Acc",
    description:
      "Upload hình ảnh và tự định giá. Admin sẽ duyệt nhanh bài đăng để tăng độ uy tín, giúp bạn dễ dàng chốt đơn.",
  },
  {
    step: 3,
    icon: ShieldCheck,
    color: "amber",
    title: "Nhận Tiền An Toàn",
    description:
      "Khách chốt đơn qua web, THC EFB trung gian bảo lãnh. Bạn giao acc chuẩn — tiền về túi ngay.",
  },
];

const colorMap: Record<string, { bg: string; icon: string; ring: string; step: string }> = {
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-500", ring: "ring-indigo-200", step: "bg-indigo-500 text-white" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", ring: "ring-emerald-200", step: "bg-emerald-500 text-white" },
  amber: { bg: "bg-amber-50", icon: "text-amber-500", ring: "ring-amber-200", step: "bg-amber-500 text-white" },
};

export function RecruitAdminSection() {
  const [open, setOpen] = useState(false);

  // Auto-open when navigated via #tuyen-ctv anchor or hero CTA click
  useEffect(() => {
    if (window.location.hash === "#tuyen-ctv") {
      setOpen(true);
    }

    const onOpen = () => setOpen(true);
    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#tuyen-ctv") setOpen(true);
    });
    window.addEventListener("open-recruit", onOpen);
    return () => {
      window.removeEventListener("open-recruit", onOpen);
    };
  }, []);

  return (
    <section id="tuyen-ctv" className="scroll-mt-16 border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50">
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
                Trở Thành Đối Tác Bán Hàng
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
          {/* Header */}
          <div className="mb-8 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Trở Thành Đối Tác Bán Hàng Cùng THC EFB
            </h2>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              Bạn có nhiều acc ngon nhưng bán trên Group quá chật vật? Mở ngay
              &ldquo;gian hàng&rdquo; miễn phí trên hệ thống của chúng tôi để
              tối ưu hóa lợi nhuận!
            </p>
          </div>

          {/* 3-step cards */}
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ step, icon: Icon, color, title, description }) => {
              const c = colorMap[color];
              return (
                <div
                  key={step}
                  className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.step}`}>
                      {step}
                    </span>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.bg} ring-1 ${c.ring}`}>
                      <Icon className={`h-4.5 w-4.5 ${c.icon}`} />
                    </div>
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold text-slate-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {description}
                  </p>
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
                Nhắn Zalo
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
