"use client";

import { useState, useTransition } from "react";
import { Star, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitReview } from "@/app/actions/review-actions";
import type { PublicReview } from "@/types/database";

function StarRating({
  rating,
  onSelect,
  interactive = false,
  size = "md",
}: {
  rating: number;
  onSelect?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md";
}) {
  const [hover, setHover] = useState(0);
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onSelect?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform ${interactive ? "hover:scale-110" : ""}`}
        >
          <Star
            className={`${starSize} ${
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  const date = new Date(review.created_at);
  const formattedDate = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {review.reviewer_name}
            </p>
            <p className="text-[11px] text-slate-400">{formattedDate}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      {review.comment && (
        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
          {review.comment}
        </p>
      )}
    </div>
  );
}

export function ReviewSection({
  accountId,
  reviews,
  isSold,
}: {
  accountId: string;
  reviews: PublicReview[];
  isSold: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0) {
      setMessage({ type: "error", text: "Vui lòng nhập tên và chọn số sao." });
      return;
    }

    startTransition(async () => {
      const result = await submitReview({
        accountId,
        reviewerName: name.trim(),
        rating,
        comment: comment.trim() || undefined,
      });

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: result.message ?? "Đánh giá đã được gửi!",
        });
        setName("");
        setRating(0);
        setComment("");
      }
    });
  };

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Đánh giá</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={Math.round(avgRating)} size="sm" />
            <span className="text-sm font-semibold text-slate-700">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({reviews.length} đánh giá)
            </span>
          </div>
        )}
      </div>

      {/* Existing reviews */}
      {reviews.length > 0 && (
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <p className="mt-3 text-sm text-slate-400">
          Chưa có đánh giá nào. Hãy là người đầu tiên!
        </p>
      )}

      {/* Submit review form (only for sold accounts) */}
      {isSold && (
        <form onSubmit={handleSubmit} className="mt-5 border-t border-slate-100 pt-5">
          <p className="mb-3 text-sm font-medium text-slate-700">
            Bạn đã mua tài khoản này? Để lại đánh giá!
          </p>

          {message && (
            <div
              className={`mb-3 rounded-lg px-3 py-2 text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Input
                placeholder="Tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="h-9 rounded-lg border-slate-200 text-sm"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-slate-500">Đánh giá sao</p>
              <StarRating
                rating={rating}
                onSelect={setRating}
                interactive
              />
            </div>
            <div>
              <textarea
                placeholder="Nhận xét (không bắt buộc, tối đa 500 ký tự)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Send className="h-3.5 w-3.5" />
              {isPending ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
