import Link from "next/link";
import { type LucideIcon, Megaphone, ChevronRight } from "lucide-react";

type Card = {
  href: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  descFull: string;
  cta: string;
  ctaStyle: string;
  badge?: string;
};

const cards: Card[] = [
  {
    href: "/sell",
    icon: Megaphone,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15 border-amber-500/25",
    title: "Thanh lý acc",
    desc: "Tạo yêu cầu, người mua sẽ liên hệ",
    descFull:
      "Tạo yêu cầu thanh lý, người thu mua phù hợp sẽ liên hệ bạn.",
    cta: "Tạo yêu cầu",
    ctaStyle:
      "border border-amber-500/40 text-amber-300 hover:bg-amber-500/10",
  },
];

export function RecruitHeroCTA() {
  return (
    <div className="mx-auto mt-5 grid w-full max-w-xl grid-cols-1 gap-2 sm:mt-10 sm:gap-4 lg:mx-0">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group relative flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 backdrop-blur-sm transition-all hover:border-white/15 hover:bg-white/[0.07] sm:flex-col sm:items-start sm:rounded-2xl sm:p-5"
        >
          {/* Icon */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 sm:rounded-xl ${card.iconBg}`}
          >
            <card.icon
              className={`h-4 w-4 sm:h-5 sm:w-5 ${card.iconColor}`}
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 text-left sm:flex-none">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold text-white sm:text-sm">
                {card.title}
              </h3>
              {card.badge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-px text-[10px] font-semibold text-emerald-400">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400 sm:h-1.5 sm:w-1.5" />
                  {card.badge}
                </span>
              )}
            </div>
            {/* Short desc on mobile, full on desktop */}
            <p className="mt-0.5 text-[11px] leading-snug text-slate-400 sm:hidden">
              {card.desc}
            </p>
            <p className="mt-1 hidden text-xs leading-relaxed text-slate-400 sm:block">
              {card.descFull}
            </p>
          </div>

          {/* Arrow on mobile, CTA button on desktop */}
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-slate-300 sm:hidden" />
          <span
            className={`hidden rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:mt-auto sm:inline-flex ${card.ctaStyle}`}
          >
            {card.cta}
          </span>
        </Link>
      ))}
    </div>
  );
}
