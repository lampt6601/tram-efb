import Link from "next/link";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import zaloIcon from "@/assets/icons/zalo.png";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">
            <span className="text-indigo-400">THC</span> eFootball Shop
          </h1>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 transition-colors hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10" />
          <a
            href="https://zalo.me/g/umniisdttnw5kcubv74y"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200 sm:px-4 sm:text-sm"
            title="Tham gia Group Zalo Mua Bán Acc"
          >
            <Image src={zaloIcon} alt="Zalo" className="h-4 w-4 object-contain sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Shop Account Trên Zalo</span>
            <span className="sm:hidden">Zalo Box</span>
          </a>
        </div>
      </div>
    </header>
  );
}
