"use client";

import { MessageCircle, ExternalLink } from "lucide-react";

interface SellerShopContactProps {
  transactionBoxUrl?: string;
}

export function SellerShopContact({
  transactionBoxUrl,
}: SellerShopContactProps) {
  if (!transactionBoxUrl) return null;

  return (
    <div className="mt-2">
      <a
        href={transactionBoxUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Tham gia Box Giao Dịch
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    </div>
  );
}
