"use client";

import { STATUS_COLORS } from "@/lib/constants";

import { CheckCircle, Clock, CheckCheck } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const statusTranslations: Record<string, string> = {
    Available: "Sẵn Sàng",
    Pending: "Đang Chờ",
    Sold: "Đã Bán",
  };

  const StatusIcon = () => {
    switch (status) {
      case "Available":
        return <CheckCircle className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Sold":
        return <CheckCheck className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const translatedStatus = statusTranslations[status] || status;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}
      title={translatedStatus}
    >
      <span className="sm:hidden flex items-center justify-center -mx-1 py-0.5">
        <StatusIcon />
      </span>
      <span className="hidden sm:inline">{translatedStatus}</span>
    </span>
  );
}
