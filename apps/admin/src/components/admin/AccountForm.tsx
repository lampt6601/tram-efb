"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import {
  ArrowLeft,
  X,
  UploadCloud,
  Star,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import {
  AndroidCoinIcon,
  IosCoinIcon,
} from "@thc-efb/ui/platform-coin-icons";
import Link from "next/link";
import type { Account, Email, AccountStatus } from "@thc-efb/supabase/types";
import { useForm, Controller } from "react-hook-form";
import { notifyAdminAction } from "@/app/actions/notify-admin";
import { checkAdminRestricted } from "@/app/actions/account-actions";
import { useParallelUpload } from "@/hooks/use-parallel-upload";
import { Input } from "@thc-efb/ui/input";
import { CurrencyInput } from "@thc-efb/ui/currency-input";
import { Label } from "@thc-efb/ui/label";
import { Button } from "@thc-efb/ui/button";
import { Checkbox } from "@thc-efb/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@thc-efb/ui/select";
import { cn } from "@thc-efb/shared/utils";
import { toast } from "sonner";
import { adminThumb } from "@thc-efb/shared/image-utils";
import { MAX_IMAGE_UPLOAD_BYTES } from "@thc-efb/shared/constants";

interface AccountFormProps {
  account?: Account | null;
  /** True when creating a new account pre-filled from an existing one */
  duplicating?: boolean;
  availableEmails: Email[];
  /** When true, renders without outer wrapper/back link for use inside Sheet */
  embedded?: boolean;
  /** Called after successful save in embedded mode */
  onSuccess?: () => void;
}

type AccountFormValues = {
  title: string;
  description: string;
  purchasePrice: string;
  sellingPrice: string;
  status: AccountStatus;
  totalGp: string;
  totalCoinsAndroid: string;
  totalCoinsIos: string;
  emailId: string;
  isClone: boolean;
  originalPrice: string;
  serverRegion: string;
  monthlyLogQuota: string;
  depositCustomerName: string;
  depositCustomerContact: string;
  depositAmount: string;
  depositHoldUntil: string;
  depositNotes: string;
};

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

const selectClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

export function AccountForm({ account, duplicating, availableEmails, embedded, onSuccess }: AccountFormProps) {
  const isEditing = !!account && !duplicating;
  const [images, setImages] = useState<string[]>(account?.images ?? []);
  const [primaryImage, setPrimaryImage] = useState<string | null>(
    account?.primary_image_url ?? (account?.images?.[0] || null),
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [quickMode] = useState(false);
  /** In edit mode, image section is collapsed by default for performance */
  const [showImages, setShowImages] = useState(!isEditing);
  /** True if admin is restricted (non-super, no auto_approve) — updates need re-approval */
  const [isRestricted, setIsRestricted] = useState(false);
  const {
    files: uploadFiles,
    overallProgress,
    isUploading,
    doneCount,
    totalCount,
    upload: startParallelUpload,
    reset: resetUploadState,
  } = useParallelUpload();

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const defaultValues = useMemo<AccountFormValues>(
    () => ({
      title: account?.title ?? "",
      description: account?.description ?? "",
      purchasePrice: account?.purchase_price != null ? Math.round(account.purchase_price).toString() : "",
      sellingPrice: account?.selling_price != null ? Math.round(account.selling_price).toString() : "",
      status: account?.status ?? "Available",
      totalGp: account?.total_gp?.toString() ?? "",
      totalCoinsAndroid: account?.total_coins_android?.toString() ?? "",
      totalCoinsIos: account?.total_coins_ios?.toString() ?? "",
      emailId: account?.email_id ?? "",
      isClone: account?.is_clone ?? false,
      originalPrice: account?.original_price != null ? Math.round(account.original_price).toString() : "",
      serverRegion: account?.server_region ?? "",
      monthlyLogQuota: account?.monthly_log_quota?.toString() ?? "",
      depositCustomerName: account?.deposit_customer_name ?? "",
      depositCustomerContact: account?.deposit_customer_contact ?? "",
      depositAmount: account?.deposit_amount?.toString() ?? "",
      depositHoldUntil: account?.deposit_hold_until?.split("T")[0] ?? "",
      depositNotes: account?.deposit_notes ?? "",
    }),
    [account],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (isEditing && account.email_id) {
      setValue("emailId", account.email_id);
    }
  }, [isEditing, account, setValue]);

  // Determine if current admin is restricted (needs re-approval on edits)
  // Uses server action to bypass RLS on admin_settings table
  useEffect(() => {
    checkAdminRestricted().then(setIsRestricted);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const valid = filesArray.filter((f) => f.size <= MAX_IMAGE_UPLOAD_BYTES);
      const rejected = filesArray.filter(
        (f) => f.size > MAX_IMAGE_UPLOAD_BYTES,
      );
      if (rejected.length > 0) {
        toast.error(
          `${rejected.length} ảnh vượt 4MB đã bỏ qua. Vui lòng chọn ảnh nhỏ hơn 4MB.`,
        );
      }
      if (valid.length > 0) {
        setSelectedFiles((prev) => [...prev, ...valid]);
        setPreviews((prev) => [
          ...prev,
          ...valid.map((f) => URL.createObjectURL(f)),
        ]);
      }
    }
  };

  const removeExistingImage = (index: number) => {
    const imgToRemove = images[index];
    if (primaryImage === imgToRemove) setPrimaryImage(null);
    setImages(images.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    const previewToRemove = previews[index];
    if (primaryImage === previewToRemove) setPrimaryImage(null);
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );
      const valid = filesArray.filter((f) => f.size <= MAX_IMAGE_UPLOAD_BYTES);
      const rejected = filesArray.filter(
        (f) => f.size > MAX_IMAGE_UPLOAD_BYTES,
      );
      if (rejected.length > 0) {
        toast.error(
          `${rejected.length} ảnh vượt 4MB đã bỏ qua. Vui lòng chọn ảnh nhỏ hơn 4MB.`,
        );
      }
      if (valid.length > 0) {
        setSelectedFiles((prev) => [...prev, ...valid]);
        setPreviews((prev) => [
          ...prev,
          ...valid.map((f) => URL.createObjectURL(f)),
        ]);
      }
    }
  };

  const addImageFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    const valid = imageFiles.filter((f) => f.size <= MAX_IMAGE_UPLOAD_BYTES);
    const rejected = imageFiles.filter((f) => f.size > MAX_IMAGE_UPLOAD_BYTES);
    if (rejected.length > 0) {
      toast.error(
        `${rejected.length} ảnh vượt 4MB đã bỏ qua. Vui lòng chọn ảnh nhỏ hơn 4MB.`,
      );
    }
    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid]);
      setPreviews((prev) => [
        ...prev,
        ...valid.map((f) => URL.createObjectURL(f)),
      ]);
    }
  };

  // Auto-select the first image as primary when none is set yet
  useEffect(() => {
    if (!primaryImage) {
      const first = images[0] ?? previews[0] ?? null;
      if (first) setPrimaryImage(first);
    }
  }, [images, previews, primaryImage]);

  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      const files = Array.from(e.clipboardData?.files ?? []);
      addImageFiles(files);
    };
    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, []);

  const onSubmit = async (values: AccountFormValues) => {
    if (images.length === 0 && selectedFiles.length === 0) {
      setImageError("Vui lòng tải lên ít nhất 1 hình ảnh");
      return;
    }
    setImageError("");
    setLoading(true);

    try {
      const oversized = selectedFiles.filter(
        (f) => f.size > MAX_IMAGE_UPLOAD_BYTES,
      );
      if (oversized.length > 0) {
        setImageError(
          "Một hoặc nhiều ảnh vượt 4MB. Vui lòng chọn ảnh nhỏ hơn 4MB.",
        );
        setLoading(false);
        return;
      }

      let uploadedUrls: string[] = [];
      let finalPrimaryUrl = primaryImage;

      if (selectedFiles.length > 0) {
        const results = await startParallelUpload(selectedFiles);
        const failedCount = results.filter((url) => !url).length;
        if (failedCount > 0) {
          toast.error(`${failedCount} ảnh tải lên thất bại. Vui lòng thử lại.`);
          setLoading(false);
          return;
        }
        uploadedUrls = results;

        // Map primary image from preview URL to uploaded URL
        for (let i = 0; i < previews.length; i++) {
          if (primaryImage === previews[i]) {
            finalPrimaryUrl = uploadedUrls[i];
          }
        }
      }

      const finalImages = [...images, ...uploadedUrls];

      if (
        !finalImages.includes(finalPrimaryUrl as string) &&
        finalImages.length > 0
      ) {
        finalPrimaryUrl = finalImages[0];
      } else if (finalImages.length === 0) {
        finalPrimaryUrl = null;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user)
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");

      const payload = {
        title: values.title,
        description: values.description?.trim() || null,
        purchase_price: Math.round(Number(values.purchasePrice) || 0),
        selling_price: Math.round(Number(values.sellingPrice) || 0),
        status: values.status,
        total_gp: Math.round(Number(values.totalGp) || 0),
        total_coins_android: Math.round(Number(values.totalCoinsAndroid) || 0),
        total_coins_ios: Math.round(Number(values.totalCoinsIos) || 0),
        team_strength: 0,
        server_region: values.serverRegion || null,
        monthly_log_quota:
          values.monthlyLogQuota !== ""
            ? Math.round(Number(values.monthlyLogQuota))
            : null,
        email_id: values.emailId || null,
        ...(isEditing ? {} : { is_priority: false }),
        is_clone: values.isClone,
        original_price: values.originalPrice
          ? Math.round(Number(values.originalPrice))
          : null,
        images: finalImages,
        primary_image_url: finalPrimaryUrl,
        user_id: user.id,
        // Deposit fields — clear when not Deposited
        ...(values.status === "Deposited"
          ? {
              deposit_customer_name: values.depositCustomerName?.trim() || null,
              deposit_customer_contact:
                values.depositCustomerContact?.trim() || null,
              deposit_amount: values.depositAmount
                ? parseFloat(values.depositAmount)
                : null,
              deposit_hold_until: values.depositHoldUntil || null,
              deposit_notes: values.depositNotes?.trim() || null,
            }
          : {
              deposit_customer_name: null,
              deposit_customer_contact: null,
              deposit_amount: null,
              deposit_hold_until: null,
              deposit_notes: null,
            }),
      };

      let accountId = account?.id;
      let needsApproval = false;
      let isResubmitting = false;

      // Auto-resubmit when editing a rejected account
      if (isEditing && account.is_rejected) {
        (payload as Record<string, unknown>).is_rejected = false;
        (payload as Record<string, unknown>).rejection_reason = null;
        (payload as Record<string, unknown>).reviewed_by = null;
        (payload as Record<string, unknown>).reviewed_at = null;
        needsApproval = true;
        isResubmitting = true;
      }

      // Re-approval check for restricted admins editing approved accounts
      if (isEditing && isRestricted && account.is_approved) {
        const priceDecreased =
          payload.selling_price < (account.selling_price ?? 0);
        const onlyPriceChanged =
          payload.title === (account.title ?? "") &&
          payload.purchase_price === (account.purchase_price ?? 0) &&
          payload.status === (account.status ?? "Available") &&
          payload.total_gp === (account.total_gp ?? 0) &&
          payload.total_coins_android === (account.total_coins_android ?? 0) &&
          payload.total_coins_ios === (account.total_coins_ios ?? 0) &&
          (payload.server_region ?? null) === (account.server_region ?? null) &&
          (payload.monthly_log_quota ?? null) ===
            (account.monthly_log_quota ?? null) &&
          (payload.email_id ?? null) === (account.email_id ?? null) &&
          payload.is_clone === (account.is_clone ?? false) &&
          (payload.original_price ?? null) ===
            (account.original_price ?? null) &&
          JSON.stringify(payload.images) ===
            JSON.stringify(account.images ?? []) &&
          (payload.primary_image_url ?? null) ===
            (account.primary_image_url ?? null);

        const skipReApproval = priceDecreased && onlyPriceChanged;

        if (!skipReApproval) {
          (payload as Record<string, unknown>).is_approved = false;
          (payload as Record<string, unknown>).is_rejected = false;
          needsApproval = true;
        }
      }

      if (isEditing) {
        const { error: err } = await supabase
          .from("accounts")
          .update(payload)
          .eq("id", account.id);
        if (err) throw err;
      } else {
        const { data: inserted, error: err } = await supabase
          .from("accounts")
          .insert(payload)
          .select("id, is_approved")
          .single();
        if (err) throw err;
        accountId = inserted?.id;
        needsApproval = !inserted?.is_approved;
      }

      try {
        const actionType = isEditing
          ? needsApproval
            ? "RE_APPROVAL"
            : "UPDATE"
          : "CREATE";
        await notifyAdminAction(
          actionType,
          payload.title,
          {
            purchasePrice: payload.purchase_price || undefined,
            sellingPrice: payload.selling_price || undefined,
            originalPrice: payload.original_price,
          },
          accountId,
          finalPrimaryUrl ?? null,
          needsApproval,
        );
      } catch (notifyErr) {
        console.error(
          "Notification failed, but continuing with save:",
          notifyErr,
        );
      }

      resetUploadState();
      if (isEditing && needsApproval) {
        toast.info(isResubmitting ? "Đã cập nhật và gửi lại để duyệt." : "Tài khoản đã chuyển về chờ duyệt do có thay đổi nội dung.");
      } else {
        toast.success(
          isEditing ? "Đã cập nhật tài khoản" : "Đã tạo tài khoản mới",
        );
      }
      router.refresh();
      if (embedded && onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/accounts");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu tài khoản.",
      );
      setLoading(false);
    }
  };

  const isCloneValue = watch("isClone");
  const statusValue = watch("status");

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="flex-1 border-t border-slate-100 dark:border-slate-700" />
    </div>
  );

  const formContent = (
        <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-5", embedded ? "p-5" : "mt-5")}>

          {/* ── Thông tin cơ bản ── */}
          <SectionHeader label="Thông tin" />

          <div>
            <Label className="text-slate-700 dark:text-slate-300">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              {...register("title", { required: "Vui lòng nhập tiêu đề" })}
              aria-invalid={!!errors.title}
              className={cn(inputClass, "mt-1.5")}
              placeholder="ví dụ: Android Cực VIP — Lực Chiến 5000+"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {!quickMode && (
            <div>
              <Label className="text-slate-700 dark:text-slate-300">
                Mô tả chi tiết
              </Label>
              <textarea
                {...register("description")}
                rows={3}
                className={cn(inputClass, "mt-1.5 resize-none")}
                placeholder="Kẹp Messi + Pele, ruột dày, có pack Arsenal, bảo kê 30 ngày..."
              />
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                Mô tả cầu thủ, pack, đội hình nổi bật. Giúp khách hiểu acc mà
                không cần hỏi.
              </p>
            </div>
          )}

          {/* ── Giá ── */}
          <SectionHeader label="Giá (đơn vị: nghìn đồng)" />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-slate-700 dark:text-slate-300">
                Giá nhập <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="purchasePrice"
                control={control}
                rules={{
                  required: "Vui lòng nhập giá nhập",
                  min: { value: 1000, message: "Tối thiểu 1k" },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!errors.purchasePrice}
                    min={1}
                    step={1}
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="VD: 130"
                  />
                )}
              />
              {errors.purchasePrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.purchasePrice.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300">
                Giá bán <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="sellingPrice"
                control={control}
                rules={{
                  required: "Vui lòng nhập giá bán",
                  min: { value: 1000, message: "Tối thiểu 1k" },
                  validate: (val, formValues) => {
                    const sp = Math.round(Number(val)) || 0;
                    const pp = Math.round(Number(formValues.purchasePrice)) || 0;
                    if (sp > pp * 2) return "Không được lớn hơn 2 lần Giá nhập";
                    return true;
                  },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!errors.sellingPrice}
                    min={1}
                    step={1}
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="VD: 130"
                  />
                )}
              />
              {errors.sellingPrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.sellingPrice.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300">
                Giá gốc{" "}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  (gạch ngang)
                </span>
              </Label>
              <Controller
                name="originalPrice"
                control={control}
                rules={{
                  validate: (value, formValues) => {
                    if (!value) return true;
                    const v = Math.round(Number(value));
                    if (v < 1000) return "Tối thiểu 1k";
                    if (v <= Math.round(Number(formValues.sellingPrice)))
                      return "Phải lớn hơn giá bán";
                    return true;
                  },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!errors.originalPrice}
                    min={1}
                    step={1}
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="Để trống nếu không sale"
                  />
                )}
              />
              {errors.originalPrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.originalPrice.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Cài đặt ── */}
          <SectionHeader label="Cài đặt" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-slate-700 dark:text-slate-300">
                Trạng thái <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue>
                        {(value: string) => ({ Available: "Sẵn sàng", Pending: "Đang chờ", Deposited: "Đang cọc", Sold: "Đã bán" }[value] ?? value)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Sẵn sàng</SelectItem>
                      <SelectItem value="Pending">Đang chờ</SelectItem>
                      <SelectItem value="Deposited">Đang cọc</SelectItem>
                      <SelectItem value="Sold">Đã bán</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300">
                Phân loại
              </Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors",
                    isCloneValue
                      ? "border-violet-300 bg-violet-50 dark:border-violet-500/30 dark:bg-violet-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500",
                  )}
                  onClick={() => {
                    const el = document.getElementById("isClone");
                    el?.click();
                  }}
                >
                  <Controller
                    name="isClone"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="isClone"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="isClone"
                    className="flex flex-1 cursor-pointer items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 select-none"
                  >
                    Clone
                    <Copy
                      className={`h-4 w-4 ${isCloneValue ? "text-violet-500" : "text-slate-300"}`}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ── Thông tin cọc (chỉ hiện khi status = Deposited) ── */}
          {statusValue === "Deposited" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3 dark:border-blue-500/30 dark:bg-blue-500/5">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                Thông tin cọc
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">
                    Tên khách hàng *
                  </Label>
                  <Input
                    {...register("depositCustomerName")}
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">
                    Liên hệ (SĐT / Zalo / FB)
                  </Label>
                  <Input
                    {...register("depositCustomerContact")}
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="VD: 0901234567"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">
                    Số tiền cọc *
                  </Label>
                  <Controller
                    name="depositAmount"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                        min={0}
                        step={1}
                        className={cn(inputClass, "mt-1.5")}
                        placeholder="VD: 50"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">
                    Giữ đến ngày *
                  </Label>
                  <Input
                    type="date"
                    {...register("depositHoldUntil")}
                    className={cn(inputClass, "mt-1.5")}
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300">
                  Ghi chú
                </Label>
                <textarea
                  {...register("depositNotes")}
                  rows={2}
                  className={cn(inputClass, "mt-1.5 resize-none")}
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>
          )}

          {/* ── Chỉ số ── */}
          {!quickMode && (
            <>
              <SectionHeader label="Chỉ số" />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 items-end">
                <div>
                  <div className="flex h-[22px] items-center">
                    <Label className="text-slate-700 dark:text-slate-300">
                      GP
                    </Label>
                  </div>
                  <Input
                    type="number"
                    {...register("totalGp", {
                      min: { value: 0, message: "Phải >= 0" },
                    })}
                    aria-invalid={!!errors.totalGp}
                    min="0"
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="0"
                  />
                  {errors.totalGp && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.totalGp.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex h-[22px] items-center">
                    <Label className="text-slate-700 inline-flex items-center gap-1">
                      Coins <AndroidCoinIcon size={18} />
                    </Label>
                  </div>
                  <Input
                    type="number"
                    {...register("totalCoinsAndroid", {
                      min: { value: 0, message: "Phải >= 0" },
                    })}
                    aria-invalid={!!errors.totalCoinsAndroid}
                    min="0"
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="0"
                  />
                  {errors.totalCoinsAndroid && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.totalCoinsAndroid.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex h-[22px] items-center">
                    <Label className="text-slate-700 inline-flex items-center gap-1">
                      Coins <IosCoinIcon size={18} />
                    </Label>
                  </div>
                  <Input
                    type="number"
                    {...register("totalCoinsIos", {
                      min: { value: 0, message: "Phải >= 0" },
                    })}
                    aria-invalid={!!errors.totalCoinsIos}
                    min="0"
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="0"
                  />
                  {errors.totalCoinsIos && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.totalCoinsIos.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex h-[22px] items-center">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Log / tháng
                    </Label>
                  </div>
                  <Input
                    type="number"
                    {...register("monthlyLogQuota", {
                      min: { value: 0, message: "Phải >= 0" },
                    })}
                    aria-invalid={!!errors.monthlyLogQuota}
                    min="0"
                    step="1"
                    className={cn(inputClass, "mt-1.5")}
                    placeholder="—"
                  />
                  {errors.monthlyLogQuota && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.monthlyLogQuota.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Liên kết ── */}
          {!quickMode && (
            <>
              <SectionHeader label="Liên kết" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">
                    Email
                  </Label>
                  <Controller
                    name="emailId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "__all__"}
                        onValueChange={(val) =>
                          field.onChange(val === "__all__" ? "" : val)
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue>
                            {(value: string) => {
                              if (!value || value === "__all__") return "Không có";
                              return availableEmails.find((e) => e.id === value)?.email_address ?? value;
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Không có</SelectItem>
                          {availableEmails.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.email_address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">
                    Server / Vùng
                  </Label>
                  <Controller
                    name="serverRegion"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "__all__"}
                        onValueChange={(val) =>
                          field.onChange(val === "__all__" ? "" : val)
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue>
                            {(value: string) => ({ __all__: "Chưa chọn", Japan: "Nhật (Japan)", Morocco: "Maroc (Morocco)", "Hong Kong": "Hong Kong", Other: "Khác" }[value] ?? value)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Chưa chọn</SelectItem>
                          <SelectItem value="Japan">Nhật (Japan)</SelectItem>
                          <SelectItem value="Morocco">Maroc (Morocco)</SelectItem>
                          <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                          <SelectItem value="Other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Hình ảnh ── */}
          {isEditing && !showImages ? (
            <button
              type="button"
              onClick={() => setShowImages(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            >
              <ImageIcon className="h-5 w-5 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Hình ảnh ({images.length} ảnh)
                </span>
                {images.length > 0 && (
                  <div className="mt-1.5 flex gap-1.5 overflow-hidden">
                    {images.slice(0, 5).map((img, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={i}
                        src={adminThumb(img)}
                        alt=""
                        className="h-10 w-16 shrink-0 rounded-md object-cover border border-slate-200 dark:border-slate-600"
                      />
                    ))}
                    {images.length > 5 && (
                      <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        +{images.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          ) : (
          <>
          <SectionHeader label="Hình ảnh" />

          <div>
            <div
              onDragOver={onDragOver}
              onDrop={onDrop}
              tabIndex={0}
              className="flex items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-5 transition-colors hover:border-indigo-400 hover:bg-slate-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-indigo-500 dark:hover:bg-slate-800"
            >
              <UploadCloud
                className="h-8 w-8 shrink-0 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Tải ảnh lên
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <span>hoặc kéo thả vào đây</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  PNG, JPG, GIF · tối đa 5MB ·{" "}
                  <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
                    Ctrl+V
                  </kbd>{" "}
                  để dán
                </p>
              </div>
            </div>

            {imageError && (
              <p className="mt-2 text-xs text-red-600">{imageError}</p>
            )}

            {/* Upload progress bar */}
            {totalCount > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {isUploading
                      ? `Đang tải ${doneCount}/${totalCount} ảnh...`
                      : `Đã tải ${doneCount}/${totalCount} ảnh`}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {overallProgress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                {/* Per-file status */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {uploadFiles.map((f, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium",
                        f.status === "done" &&
                          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                        f.status === "uploading" &&
                          "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
                        f.status === "pending" &&
                          "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
                        f.status === "error" &&
                          "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
                      )}
                    >
                      {f.status === "done" && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {f.status === "uploading" && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {f.status === "error" && (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      Ảnh {i + 1}
                      {f.status === "uploading" && ` ${f.progress}%`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(images.length > 0 || previews.length > 0) && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((img, i) => (
                  <div
                    key={`existing-${i}`}
                    className={cn(
                      "relative aspect-video overflow-hidden rounded-xl border-2 bg-slate-50 shadow-sm dark:bg-slate-800",
                      primaryImage === img
                        ? "border-indigo-500"
                        : "border-slate-200 dark:border-slate-600",
                    )}
                  >
                    {primaryImage === img && (
                      <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-indigo-600/90 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white shadow-sm backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-current" /> Đại diện
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={adminThumb(img)}
                      alt={`Ảnh ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
                      {primaryImage !== img && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(img)}
                          className="rounded-full bg-white/90 p-1.5 text-indigo-600 shadow-md backdrop-blur-sm hover:bg-white"
                          title="Đặt làm ảnh đại diện"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="rounded-full bg-red-500/90 p-1.5 text-white shadow-md backdrop-blur-sm hover:bg-red-600"
                        title="Xóa ảnh"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {previews.map((preview, i) => (
                  <div
                    key={`new-${i}`}
                    className={cn(
                      "relative aspect-video overflow-hidden rounded-xl border-2 bg-slate-50 shadow-sm dark:bg-slate-800",
                      primaryImage === preview
                        ? "border-indigo-500"
                        : "border-slate-200 dark:border-slate-600",
                    )}
                  >
                    <div
                      className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wide text-white shadow-sm backdrop-blur-sm
                      bg-indigo-600/90"
                    >
                      {primaryImage === preview ? (
                        <>
                          <Star className="h-3 w-3 fill-current" /> Đại diện
                        </>
                      ) : (
                        "MỚI"
                      )}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Ảnh mới ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 z-20 flex gap-1.5">
                      {primaryImage !== preview && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(preview)}
                          className="rounded-full bg-white/90 p-1.5 text-indigo-600 shadow-md backdrop-blur-sm hover:bg-white"
                          title="Đặt làm ảnh đại diện"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="rounded-full bg-red-500/90 p-1.5 text-white shadow-md backdrop-blur-sm hover:bg-red-600"
                        title="Xóa ảnh"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
          )}

          {/* ── Submit ── */}
          <div className="flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-700">
            <Button
              type="submit"
              loading={loading}
              loadingLabel={
                isUploading
                  ? `Đang tải ảnh ${doneCount}/${totalCount}...`
                  : isEditing
                    ? "Đang lưu..."
                    : "Đang tạo..."
              }
              className="h-10 min-w-[10rem] bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isEditing ? "Cập nhật" : "Tạo tài khoản"}
            </Button>
            {!embedded && (
              <Button
                variant="outline"
                render={<Link href="/dashboard/accounts" />}
                className="h-10 px-6 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Hủy
              </Button>
            )}
          </div>
        </form>
  );

  if (embedded) return formContent;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/accounts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isEditing ? "Chỉnh Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
          </h1>
        </div>
        {formContent}
      </div>
    </div>
  );
}
