"use client";

import { useState, useTransition } from "react";
import { XCircle, RefreshCcw, Loader2, X } from "lucide-react";
import { Button } from "@thc-efb/ui/button";
import { resubmitAccount } from "@/app/actions/reviewer-actions";
import { toast } from "sonner";
import {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
} from "@thc-efb/ui/responsive-alert-dialog";

interface Props {
  accountId: string;
  accountTitle: string;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
}

export function RejectionDetailDialog({ accountId, accountTitle, rejectionReason, reviewedAt }: Props) {
  const [open, setOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleResubmit = () => {
    startTransition(async () => {
      try {
        await resubmitAccount(accountId);
        toast.success("Đã gửi lại để duyệt");
        setResubmitOpen(false);
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      }
    });
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
      >
        <XCircle className="h-3 w-3" />
        Từ chối
      </button>

      {/* Rejection detail dialog */}
      <ResponsiveAlertDialog open={open} onOpenChange={setOpen}>
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center mx-auto rounded-xl bg-rose-50 dark:bg-rose-500/10">
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <ResponsiveAlertDialogTitle>Tài khoản bị từ chối</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{accountTitle}&quot;</span>
              {reviewedAt && (
                <span className="text-slate-400">
                  {" "}· {new Date(reviewedAt).toLocaleDateString("vi-VN")}
                </span>
              )}
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>

          {rejectionReason && (
            <div className="px-4 pb-2">
              <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 dark:border-rose-500/20 dark:bg-rose-500/10">
                <p className="mb-1 text-xs font-semibold text-rose-700 dark:text-rose-400">Lý do từ chối:</p>
                <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{rejectionReason}</p>
              </div>
            </div>
          )}

          <ResponsiveAlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-1.5" />
              Đóng
            </Button>
            <Button
              onClick={() => { setOpen(false); setResubmitOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RefreshCcw className="h-4 w-4 mr-1.5" />
              Gửi lại duyệt
            </Button>
          </ResponsiveAlertDialogFooter>
        </ResponsiveAlertDialogContent>
      </ResponsiveAlertDialog>

      {/* Re-submit confirmation */}
      <ResponsiveAlertDialog open={resubmitOpen} onOpenChange={(v) => !isPending && setResubmitOpen(v)}>
        <ResponsiveAlertDialogContent>
          <ResponsiveAlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
              <RefreshCcw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <ResponsiveAlertDialogTitle>Gửi lại để duyệt?</ResponsiveAlertDialogTitle>
            <ResponsiveAlertDialogDescription>
              Tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{accountTitle}&quot;</span> sẽ được đưa trở lại hàng chờ duyệt.
              Ban duyệt sẽ nhận được thông báo.
            </ResponsiveAlertDialogDescription>
          </ResponsiveAlertDialogHeader>
          <ResponsiveAlertDialogFooter>
            <Button variant="outline" onClick={() => setResubmitOpen(false)} disabled={isPending}>Hủy</Button>
            <Button
              onClick={handleResubmit}
              disabled={isPending}
              className="min-w-[7rem] bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Đang gửi...</> : "Gửi lại"}
            </Button>
          </ResponsiveAlertDialogFooter>
        </ResponsiveAlertDialogContent>
      </ResponsiveAlertDialog>
    </>
  );
}
