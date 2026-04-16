import Image from "next/image";
import { ShieldCheck, Zap, HeartHandshake } from "lucide-react";
import facebookIcon from "@/assets/icons/facebook.webp";
import zaloIcon from "@/assets/icons/zalo.png";

export function OwnerSection() {
  return (
    <section className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatar-owner.jpeg"
                alt="Sạp Acc eFootball"
                className="h-full w-full rounded-2xl object-cover shadow-lg"
              />
              <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow dark:border-slate-800">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
              Shop
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">
              Sạp Acc eFootball
            </h2>
            <p className="mt-1.5 max-w-lg text-sm text-slate-500 dark:text-slate-400">
              Người sáng lập{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Sạp Acc eFootball
              </span>{" "}
              — chuyên cung cấp tài khoản eFootball chất lượng, giao dịch minh
              bạch và hỗ trợ tận tâm.
            </p>
            <div className="mt-3 flex items-center justify-center gap-3 sm:justify-start">
              <a
                href="/api/contact/owner?type=facebook"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook Sạp Acc eFootball"
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition-all hover:bg-blue-100 hover:scale-110 active:scale-95 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <Image
                  src={facebookIcon}
                  alt="Facebook"
                  className="h-6 w-6 object-contain transition-transform group-hover:scale-110"
                />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="/api/contact/owner?type=zalo"
                target="_blank"
                rel="noopener noreferrer"
                title="Zalo Sạp Acc eFootball"
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition-all hover:bg-blue-100 hover:scale-110 active:scale-95 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <Image
                  src={zaloIcon}
                  alt="Zalo"
                  className="h-6 w-6 object-contain transition-transform group-hover:scale-110"
                />
                <span className="sr-only">Zalo</span>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="flex shrink-0 gap-4 sm:gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center mx-auto justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/15">
                <Zap className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Nhanh Chóng</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center mx-auto justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/15">
                <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Uy Tín</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center mx-auto justify-center rounded-xl bg-rose-50 dark:bg-rose-500/15">
                <HeartHandshake className="h-5 w-5 text-rose-500 dark:text-rose-400" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Hỗ Trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
