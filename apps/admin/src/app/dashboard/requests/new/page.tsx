"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@thc-efb/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@thc-efb/ui/select";

const CONTACT_PLATFORMS = ["Zalo", "Facebook", "Zalo + Facebook", "Khác"];

type RequestFormValues = {
  detail: string;
  priceLevel: string;
  requesterName: string;
  contactPlatform: string;
};

export default function NewRequestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RequestFormValues>({
    defaultValues: {
      detail: "",
      priceLevel: "",
      requesterName: "",
      contactPlatform: "Zalo",
    },
  });

  const onSubmit = async (values: RequestFormValues) => {
    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("account_requests").insert({
      detail: values.detail.trim(),
      price_level: values.priceLevel.trim() || null,
      requester_name: values.requesterName.trim(),
      contact_platform: values.contactPlatform.trim(),
      completed: false,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/requests");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/requests"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại Yêu Cầu Tìm Acc
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Thêm Yêu Cầu Tìm Acc</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ghi nhận yêu cầu tìm account từ khách để theo dõi và xử lý.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Chi tiết yêu cầu <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("detail", {
                required: "Vui lòng nhập chi tiết yêu cầu",
              })}
              aria-invalid={!!errors.detail}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              placeholder="Ví dụ: Cần acc GP 5M+, coin Android cao, giá tầm 2–3 tr"
              rows={3}
            />
            {errors.detail && (
              <p className="mt-1 text-xs text-red-600">{errors.detail.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Mức giá
            </label>
            <input
              type="text"
              {...register("priceLevel")}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              placeholder="Ví dụ: 2–3 tr, thỏa thuận"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Tên người yêu cầu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("requesterName", {
                required: "Vui lòng nhập tên người yêu cầu",
              })}
              aria-invalid={!!errors.requesterName}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              placeholder="Tên khách hàng"
            />
            {errors.requesterName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.requesterName.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Nền tảng liên hệ <span className="text-red-500">*</span>
            </label>
            <Controller
              name="contactPlatform"
              control={control}
              rules={{
                required: "Vui lòng chọn nền tảng",
              }}
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={(val) => { if (val !== null) field.onChange(val) }}>
                    <SelectTrigger
                      aria-invalid={!!errors.contactPlatform}
                      className="mt-1.5"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.contactPlatform && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.contactPlatform.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={loading}
              loadingLabel="Đang lưu..."
              className="min-w-[8rem] rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Lưu Yêu Cầu
            </Button>
            <Link
              href="/dashboard/requests"
              className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
