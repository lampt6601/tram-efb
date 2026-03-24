import { Gamepad2 } from "lucide-react";
import Image from "next/image";
import zaloIcon from "@/assets/icons/zalo.png";
import { RecruitAdminSection } from "./RecruitAdminSection";

export function Footer() {
  return (
    <>
      <RecruitAdminSection />
      <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <Gamepad2 className="h-6 w-6 text-indigo-600" />
            <span className="text-base font-bold text-slate-900">
              THC eFootball Shop
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="https://zalo.me/g/a3v3dgaj4ugylmmnwk0u"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-2 rounded-full bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-100 hover:scale-105 active:scale-95 border border-blue-200"
              title="Tham gia Nhóm Zalo Tư Vấn"
            >
              <Image
                src={zaloIcon}
                alt="Zalo Group"
                className="h-5 w-5 object-contain"
              />
              <span>Group Tư vấn</span>
            </a>
            <a
              href="https://zalo.me/g/umniisdttnw5kcubv74y"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-2 rounded-full bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-100 hover:scale-105 active:scale-95 border border-emerald-200"
              title="Tham gia Nhóm Zalo Mua Bán Acc"
            >
              <Image
                src={zaloIcon}
                alt="Shop Zalo Trên Zalo"
                className="h-5 w-5 object-contain"
              />
              <span>Shop Zalo Trên Zalo</span>
            </a>
          </div>

          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-medium text-slate-600">Trần Hữu Cảnh</span>
            {" "}· THC eFootball Shop.
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}
