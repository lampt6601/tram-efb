import Link from "next/link";
import Image from "next/image";
import zaloIcon from "@/assets/icons/zalo.png";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/icon-shop.png"
            alt="Sạp Acc eFootball"
            width={36}
            height={36}
            priority
            className="h-9 w-9 shrink-0 rounded-lg object-cover"
          />
          <h1 className="text-lg font-bold text-white">
            Sạp Acc eFootball
          </h1>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 transition-colors hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10" />
          <a
            href="https://zalo.me/g/a3v3dgaj4ugylmmnwk0u"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200 sm:px-4 sm:text-sm"
            title="Box Acc Zalo"
          >
            <Image src={zaloIcon} alt="Zalo" className="h-4 w-4 object-contain sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Box Acc Zalo</span>
            <span className="sm:hidden">Box Zalo</span>
          </a>
        </div>
      </div>
    </header>
  );
}
