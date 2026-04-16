import Link from "next/link";
import Image from "next/image";
import zaloIcon from "@/assets/icons/zalo.png";
export function Footer() {
  return (
    <>
      <footer className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Image
                src="/icon-shop.png"
                alt="Sạp Acc eFootball"
                width={24}
                height={24}
                className="h-6 w-6 rounded-md object-cover"
              />
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sạp Acc eFootball
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="https://zalo.me/g/a3v3dgaj4ugylmmnwk0u"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2 rounded-full bg-blue-50 dark:bg-blue-500/15 px-5 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-100 dark:hover:bg-blue-500/25 hover:scale-105 active:scale-95 border border-blue-200 dark:border-blue-500/30"
                title="Box Acc Zalo"
              >
                <Image
                  src={zaloIcon}
                  alt="Zalo Group"
                  className="h-5 w-5 object-contain"
                />
                <span>Box Acc Zalo</span>
              </a>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <Link href="/faq" className="transition-colors hover:text-indigo-600">
                FAQ
              </Link>
              <span>·</span>
              <p>
                &copy; {new Date().getFullYear()}{" "}
                <span className="font-medium text-slate-600 dark:text-slate-300">Sạp Acc eFootball</span>.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
