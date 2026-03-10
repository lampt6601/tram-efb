import { Gamepad2 } from "lucide-react";
import Image from "next/image";
import facebookIcon from "@/assets/icons/facebook.webp";
import zaloIcon from "@/assets/icons/zalo.png";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <Gamepad2 className="h-6 w-6 text-indigo-600" />
            <span className="text-base font-bold text-slate-900">
              THC EFOOTBALL Shop
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
              <span>Tham gia Group Tư vấn</span>
            </a>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/share/1B7kgySoVd/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
                title="Facebook THC eFootball Shop"
              >
                <Image
                  src={facebookIcon}
                  alt="Facebook"
                  className="h-8 w-8 object-contain transition-transform group-hover:scale-110"
                />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://zalo.me/0969347283"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
                title="Zalo THC eFootball Shop"
              >
                <Image
                  src={zaloIcon}
                  alt="Zalo"
                  className="h-8 w-8 object-contain transition-transform group-hover:scale-110"
                />
                <span className="sr-only">Zalo</span>
              </a>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} THC EFOOTBALL Shop.
          </p>
        </div>
      </div>
    </footer>
  );
}
