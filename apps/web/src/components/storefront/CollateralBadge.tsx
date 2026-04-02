import { ShieldCheck } from "lucide-react";
import { formatCompactCurrency } from '@thc-efb/shared/constants';
import Link from "next/link";

interface CollateralBadgeProps {
  amount: number;
}

export function CollateralBadge({ amount }: CollateralBadgeProps) {
  if (amount <= 0) return null;

  return (
    <Link
      href="/bao-ke"
      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25"
    >
      <ShieldCheck className="h-3 w-3" />
      Bảo kê: {formatCompactCurrency(amount)}
    </Link>
  );
}
