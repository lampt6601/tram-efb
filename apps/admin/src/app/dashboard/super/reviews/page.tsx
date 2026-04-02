"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import { approveReview, deleteReview } from "@/app/actions/review-actions";
import { Star, Check, Trash2, Clock } from "lucide-react";
import { Button } from "@thc-efb/ui/button";
import type { Review } from "@thc-efb/supabase/types";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 dark:fill-slate-600 text-slate-200 dark:text-slate-600"}`}
        />
      ))}
    </div>
  );
}

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const supabase = createSupabaseBrowserClient();

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, account_id, reviewer_name, rating, comment, is_approved, created_at")
      .order("created_at", { ascending: false });
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveReview(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r))
      );
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xoá đánh giá này?")) return;
    startTransition(async () => {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const approvedReviews = reviews.filter((r) => r.is_approved);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Quản lý đánh giá</h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Quản lý đánh giá</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Duyệt hoặc xoá đánh giá từ người mua
      </p>

      {/* Pending */}
      {pendingReviews.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              Chờ duyệt ({pendingReviews.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {review.reviewer_name}
                      </p>
                      <StarDisplay rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                        {review.comment}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Account: {review.account_id.slice(0, 8)}... ·{" "}
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleApprove(review.id)}
                      className="h-8 gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" /> Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleDelete(review.id)}
                      className="h-8 gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Xoá
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Đã duyệt ({approvedReviews.length})
        </h2>
        {approvedReviews.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có đánh giá nào được duyệt.</p>
        ) : (
          <div className="space-y-3">
            {approvedReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {review.reviewer_name}
                      </p>
                      <StarDisplay rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                        {review.comment}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleDelete(review.id)}
                    className="h-8 gap-1 border-rose-200 text-rose-600 hover:bg-rose-50 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xoá
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
