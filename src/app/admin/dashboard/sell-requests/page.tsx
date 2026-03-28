"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { getSellRequests, updateSellRequestStatus } from "@/app/actions/sell-request-actions";
import {
  Clock,
  Phone,
  MessageCircle,
  CheckCircle2,
  ShoppingCart,
  X,
  Banknote,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SellRequest } from "@/types/database";

const statusConfig = {
  pending: {
    label: "Chờ xử lý",
    color:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300",
    icon: Clock,
  },
  contacted: {
    label: "Đã liên hệ",
    color:
      "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300",
    icon: MessageCircle,
  },
  purchased: {
    label: "Đã thu",
    color:
      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300",
    icon: ShoppingCart,
  },
  rejected: {
    label: "Bỏ qua",
    color:
      "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
    icon: X,
  },
};

export default function SellRequestsPage() {
  const [items, setItems] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSellRequests().then((data) => {
      setItems(data as SellRequest[]);
      setLoading(false);
    });
  }, []);

  const handleUpdate = (
    id: string,
    status: "contacted" | "purchased" | "rejected",
  ) => {
    startTransition(async () => {
      const result = await updateSellRequestStatus(id, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Đã cập nhật trạng thái`);
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item)),
        );
      }
    });
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Yêu Cầu Bán Acc
        </h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Đang tải...
        </p>
      </div>
    );
  }

  const pending = items.filter((i) => i.status === "pending");
  const contacted = items.filter((i) => i.status === "contacted");
  const others = items.filter(
    (i) => i.status === "purchased" || i.status === "rejected",
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Yêu Cầu Bán Acc
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Khách muốn bán acc cho shop ({items.length} yêu cầu)
      </p>

      {/* Pending */}
      {pending.length > 0 && (
        <Section
          title={`Chờ xử lý (${pending.length})`}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          className="mt-6"
        >
          {pending.map((item) => (
            <SellRequestCard
              key={item.id}
              item={item}
              isPending={isPending}
              onContact={() => handleUpdate(item.id, "contacted")}
              onPurchase={() => handleUpdate(item.id, "purchased")}
              onReject={() => handleUpdate(item.id, "rejected")}
            />
          ))}
        </Section>
      )}

      {/* Contacted */}
      {contacted.length > 0 && (
        <Section
          title={`Đã liên hệ (${contacted.length})`}
          icon={<MessageCircle className="h-4 w-4 text-blue-500" />}
          className="mt-6"
        >
          {contacted.map((item) => (
            <SellRequestCard
              key={item.id}
              item={item}
              isPending={isPending}
              onPurchase={() => handleUpdate(item.id, "purchased")}
              onReject={() => handleUpdate(item.id, "rejected")}
            />
          ))}
        </Section>
      )}

      {/* Completed */}
      {others.length > 0 && (
        <Section
          title={`Đã xử lý (${others.length})`}
          className="mt-8"
        >
          {others.map((item) => (
            <SellRequestCard key={item.id} item={item} isPending={isPending} />
          ))}
        </Section>
      )}

      {items.length === 0 && (
        <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">
          Chưa có yêu cầu bán acc nào.
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  className = "",
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SellRequestCard({
  item,
  isPending,
  onContact,
  onPurchase,
  onReject,
}: {
  item: SellRequest;
  isPending: boolean;
  onContact?: () => void;
  onPurchase?: () => void;
  onReject?: () => void;
}) {
  const status = statusConfig[item.status];
  const StatusIcon = status.icon;
  const [showImages, setShowImages] = useState(false);

  return (
    <div
      className={`rounded-xl border p-4 ${
        item.status === "pending"
          ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {item.seller_name}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
            >
              <StatusIcon className="h-3 w-3" /> {status.label}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {item.zalo_phone}
            </span>
            <span className="flex items-center gap-1">
              <Banknote className="h-3 w-3" /> {item.price_expectation}
            </span>
            <button
              onClick={() => setShowImages(!showImages)}
              className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <ImageIcon className="h-3 w-3" /> {item.images.length} ảnh
            </button>
          </div>

          {item.description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {item.description}
            </p>
          )}

          {/* Images */}
          {showImages && item.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {item.images.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700"
                >
                  <Image
                    src={url}
                    alt={`Ảnh ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </a>
              ))}
            </div>
          )}

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {new Date(item.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Actions */}
        {(onContact || onPurchase || onReject) && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {onContact && (
              <Button
                size="sm"
                disabled={isPending}
                onClick={onContact}
                className="h-8 gap-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Đã LH
              </Button>
            )}
            {onPurchase && (
              <Button
                size="sm"
                disabled={isPending}
                onClick={onPurchase}
                className="h-8 gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Đã thu
              </Button>
            )}
            {onReject && (
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={onReject}
                className="h-8 gap-1 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
              >
                <X className="h-3.5 w-3.5" /> Bỏ qua
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
