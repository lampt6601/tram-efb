"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import { updateApplicationStatus } from "@/app/actions/seller-application-actions";
import { Check, X, Clock, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@thc-efb/ui/button";
import { toast } from "sonner";
import type { SellerApplication } from "@thc-efb/supabase/types";

const statusConfig = {
  pending: { label: "Chờ duyệt", color: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300", icon: Clock },
  approved: { label: "Đã duyệt", color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300", icon: Check },
  rejected: { label: "Từ chối", color: "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300", icon: X },
};

export default function ManageApplicationsPage() {
  const [apps, setApps] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("seller_applications")
        .select("id, full_name, email, phone, zalo_link, reason, status, created_at")
        .order("created_at", { ascending: false });
      setApps((data ?? []) as SellerApplication[]);
      setLoading(false);
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = (id: string, status: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await updateApplicationStatus(id, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          status === "approved"
            ? "Đã duyệt và tạo tài khoản thành công"
            : "Đã từ chối đơn đăng ký"
        );
        setApps((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Đơn Đăng Ký Bán Hàng</h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
      </div>
    );
  }

  const pending = apps.filter((a) => a.status === "pending");
  const others = apps.filter((a) => a.status !== "pending");

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Đơn Đăng Ký Bán Hàng</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Quản lý đơn đăng ký người bán ({apps.length} đơn)
      </p>

      {pending.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              Chờ xử lý ({pending.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pending.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                isPending={isPending}
                onApprove={() => handleUpdate(app.id, "approved")}
                onReject={() => handleUpdate(app.id, "rejected")}
              />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Đã xử lý ({others.length})
          </h2>
          <div className="space-y-3">
            {others.map((app) => (
              <ApplicationCard key={app.id} app={app} isPending={isPending} />
            ))}
          </div>
        </div>
      )}

      {apps.length === 0 && (
        <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">Chưa có đơn đăng ký nào.</p>
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  isPending,
  onApprove,
  onReject,
}: {
  app: SellerApplication;
  isPending: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const status = statusConfig[app.status];
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-xl border p-4 ${app.status === "pending" ? "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`}>
      <div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{app.full_name}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
              <StatusIcon className="h-3 w-3" /> {status.label}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {app.email}
            </span>
            {app.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {app.phone}
              </span>
            )}
            {app.zalo_link && (
              <a
                href={app.zalo_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <MessageCircle className="h-3 w-3" /> Zalo
              </a>
            )}
          </div>

          {app.reason && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{app.reason}</p>
          )}

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {new Date(app.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {app.status === "pending" && onApprove && onReject && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={isPending}
              onClick={onApprove}
              className="h-8 gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5" /> Duyệt & Tạo TK
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={onReject}
              className="h-8 gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <X className="h-3.5 w-3.5" /> Từ chối
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
