import Link from "next/link";
import { UserPlus } from "lucide-react";

export function RecruitHeroCTA() {
  return (
    <Link
      href="/seller/apply"
      className="mx-auto mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-indigo-300 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white active:scale-95 sm:mt-8 lg:mx-0"
    >
      <UserPlus className="h-4 w-4" />
      Trở thành cộng tác viên
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
        Đang tuyển
      </span>
    </Link>
  );
}
