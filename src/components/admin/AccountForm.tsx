"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ArrowLeft, Loader2, X, UploadCloud, Star, Copy } from "lucide-react";
import Link from "next/link";
import type { Account, Email, AccountStatus } from "@/types/database";
import { useForm, Controller } from "react-hook-form";
import { notifyAdminAction } from "@/app/actions/notify-admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AccountFormProps {
  account?: Account | null;
}

type AccountFormValues = {
  title: string;
  purchasePrice: string;
  sellingPrice: string;
  status: AccountStatus;
  totalGp: string;
  totalCoinsAndroid: string;
  totalCoinsIos: string;
  teamStrength: string;
  emailId: string;
  isPriority: boolean;
  isClone: boolean;
  originalPrice: string;
  serverRegion: string;
  monthlyLogQuota: string;
};

const inputClass =
  "w-full rounded-xl border-slate-300 px-4 py-2.5 text-sm focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const selectClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white";

export function AccountForm({ account }: AccountFormProps) {
  const isEditing = !!account;
  const [images, setImages] = useState<string[]>(account?.images ?? []);
  const [primaryImage, setPrimaryImage] = useState<string | null>(
    account?.primary_image_url ?? (account?.images?.[0] || null),
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [availableEmails, setAvailableEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const defaultValues = useMemo<AccountFormValues>(
    () => ({
      title: account?.title ?? "",
      purchasePrice: account?.purchase_price?.toString() ?? "",
      sellingPrice: account?.selling_price?.toString() ?? "",
      status: account?.status ?? "Available",
      totalGp: account?.total_gp?.toString() ?? "",
      totalCoinsAndroid: account?.total_coins_android?.toString() ?? "",
      totalCoinsIos: account?.total_coins_ios?.toString() ?? "",
      teamStrength: account?.team_strength?.toString() ?? "",
      emailId: account?.email_id ?? "",
      isPriority: account?.is_priority ?? false,
      isClone: account?.is_clone ?? false,
      originalPrice: account?.original_price?.toString() ?? "",
      serverRegion: account?.server_region ?? "",
      monthlyLogQuota: account?.monthly_log_quota?.toString() ?? "",
    }),
    [account],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    const fetchEmails = async () => {
      const { data: allEmails } = await supabase
        .from("emails")
        .select("*")
        .order("email_address");
      if (!allEmails) return;

      let query = supabase
        .from("accounts")
        .select("email_id")
        .not("email_id", "is", null);
      if (isEditing) {
        query = query.neq("id", account.id);
      }
      const { data: linkedAccounts } = await query;

      const linkedEmailIds = new Set(
        (linkedAccounts ?? []).map((a) => a.email_id),
      );
      const available = allEmails.filter((e) => !linkedEmailIds.has(e.id));

      if (isEditing && account.email_id) {
        const currentEmail = allEmails.find((e) => e.id === account.email_id);
        if (currentEmail && !available.find((e) => e.id === currentEmail.id)) {
          available.unshift(currentEmail);
        }
      }

      setAvailableEmails(available);
    };
    fetchEmails();
  }, [supabase, isEditing, account]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
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
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const addImageFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...imageFiles]);
    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

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
      const uploadedUrls: string[] = [];
      let finalPrimaryUrl = primaryImage;

      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const fileExt = file.name.split(".").pop();
          const uniqueId = Math.random().toString(36).substring(2, 15);
          const fileName = `${uniqueId}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("account-images")
            .upload(`images/${fileName}`, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage
            .from("account-images")
            .getPublicUrl(`images/${fileName}`);

          uploadedUrls.push(publicUrl);

          if (primaryImage === previews[i]) {
            finalPrimaryUrl = publicUrl;
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

      const payload = {
        title: values.title,
        purchase_price: parseInt(values.purchasePrice as string) || 0,
        selling_price: parseInt(values.sellingPrice as string) || 0,
        status: values.status,
        total_gp: parseInt(values.totalGp as string) || 0,
        total_coins_android: parseInt(values.totalCoinsAndroid as string) || 0,
        total_coins_ios: parseInt(values.totalCoinsIos as string) || 0,
        team_strength: parseInt(values.teamStrength as string) || 0,
        server_region: values.serverRegion || null,
        monthly_log_quota: values.monthlyLogQuota
          ? parseInt(values.monthlyLogQuota as string)
          : null,
        email_id: values.emailId || null,
        is_priority: values.isPriority,
        is_clone: values.isClone,
        original_price: values.originalPrice
          ? parseInt(values.originalPrice as string)
          : null,
        images: finalImages,
        primary_image_url: finalPrimaryUrl,
        user_id: user?.id,
      };

      const { error: err } = isEditing
        ? await supabase.from("accounts").update(payload).eq("id", account.id)
        : await supabase.from("accounts").insert(payload);

      if (err) throw err;

      try {
        await notifyAdminAction(
          isEditing ? "UPDATE" : "CREATE",
          payload.title,
          {
            purchasePrice: payload.purchase_price
              ? parseInt(payload.purchase_price as unknown as string)
              : undefined,
            sellingPrice: payload.selling_price
              ? parseInt(payload.selling_price as unknown as string)
              : undefined,
            originalPrice: payload.original_price,
          },
        );
      } catch (notifyErr) {
        console.error(
          "Notification failed, but continuing with save:",
          notifyErr,
        );
      }

      router.refresh();
      router.push("/admin/dashboard/accounts");
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi lưu tài khoản.");
      setLoading(false);
    }
  };

  const isPriorityValue = watch("isPriority");
  const isCloneValue = watch("isClone");

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/dashboard/accounts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại Danh sách Tài Khoản
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          {isEditing ? "Chỉnh Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {/* Title */}
          <div>
            <Label className="mb-1.5 text-slate-700">
              Tiêu Đề <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              {...register("title", { required: "Vui lòng nhập tiêu đề" })}
              aria-invalid={!!errors.title}
              className={cn(inputClass, "mt-1.5")}
              placeholder="ví dụ: Tài khoản Android Cực VIP - Lực Chiến 5000+"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Prices */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 text-slate-700">
                Giá Nhập (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                {...register("purchasePrice", {
                  required: "Vui lòng nhập giá nhập",
                  min: { value: 0, message: "Giá nhập phải >= 0" },
                })}
                aria-invalid={!!errors.purchasePrice}
                min="0"
                step="1"
                className={cn(inputClass, "mt-1.5")}
              />
              {errors.purchasePrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.purchasePrice.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 text-slate-700">
                Giá Bán Hiện Tại (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                {...register("sellingPrice", {
                  required: "Vui lòng nhập giá bán",
                  min: { value: 0, message: "Giá bán phải >= 0" },
                })}
                aria-invalid={!!errors.sellingPrice}
                min="0"
                step="1"
                className={cn(inputClass, "mt-1.5")}
              />
              {errors.sellingPrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.sellingPrice.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 text-slate-700">
                Giá Bị Gạch / Giá Gốc{" "}
                <span className="text-slate-400 font-normal">(Tuỳ chọn)</span>
              </Label>
              <Input
                type="number"
                {...register("originalPrice", {
                  min: { value: 0, message: "Giá gốc phải >= 0" },
                  validate: (value, formValues) => {
                    if (!value) return true;
                    const original = parseInt(value);
                    const selling = parseInt(formValues.sellingPrice);
                    if (original <= selling)
                      return "Giá bị gạch phải lớn hơn giá bán";
                    return true;
                  },
                })}
                aria-invalid={!!errors.originalPrice}
                min="0"
                step="1"
                className={cn(inputClass, "mt-1.5")}
                placeholder="Để trống nếu không sale"
              />
              {errors.originalPrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.originalPrice.message}
                </p>
              )}
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-slate-700">
                Trạng Thái <span className="text-red-500">*</span>
              </Label>
              <select
                {...register("status")}
                className={cn(selectClass, "mt-1.5")}
              >
                <option value="Available">Sẵn Sàng</option>
                <option value="Pending">Đang Chờ</option>
                <option value="Sold">Đã Bán</option>
              </select>
            </div>

            <div className="flex flex-col justify-center gap-2">
              <Label className="mb-1.5 hidden text-slate-700 sm:flex">
                Tùy Chọn Khác
              </Label>
              <div className="flex h-[42px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 mt-1.5">
                <Controller
                  name="isPriority"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isPriority"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label
                  htmlFor="isPriority"
                  className="flex flex-1 cursor-pointer items-center justify-between gap-1.5 text-sm font-medium text-slate-700 select-none"
                >
                  Tài Khoản Nổi Bật
                  <Star
                    className={`h-4 w-4 ${isPriorityValue ? "text-amber-500 fill-amber-500" : "text-slate-400"}`}
                  />
                </label>
              </div>
              <div className="flex h-[42px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
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
                  className="flex flex-1 cursor-pointer items-center justify-between gap-1.5 text-sm font-medium text-slate-700 select-none"
                >
                  Tài Khoản Clone
                  <Copy
                    className={`h-4 w-4 ${isCloneValue ? "text-violet-500" : "text-slate-400"}`}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <Label className="mb-1.5 text-slate-700">
                Tổng GP{" "}
                <span className="text-slate-400 font-normal">(Tuỳ chọn)</span>
              </Label>
              <Input
                type="number"
                {...register("totalGp", {
                  min: { value: 0, message: "Tổng GP phải >= 0" },
                })}
                aria-invalid={!!errors.totalGp}
                min="0"
                className={cn(inputClass, "mt-1.5")}
              />
              {errors.totalGp && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.totalGp.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 text-slate-700">
                Coins (Android){" "}
                <span className="text-slate-400 font-normal">(Tuỳ chọn)</span>
              </Label>
              <Input
                type="number"
                {...register("totalCoinsAndroid", {
                  min: { value: 0, message: "Coins (Android) phải >= 0" },
                })}
                aria-invalid={!!errors.totalCoinsAndroid}
                min="0"
                className={cn(inputClass, "mt-1.5")}
              />
              {errors.totalCoinsAndroid && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.totalCoinsAndroid.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 text-slate-700">
                Coins (iOS){" "}
                <span className="text-slate-400 font-normal">(Tuỳ chọn)</span>
              </Label>
              <Input
                type="number"
                {...register("totalCoinsIos", {
                  min: { value: 0, message: "Coins (iOS) phải >= 0" },
                })}
                aria-invalid={!!errors.totalCoinsIos}
                min="0"
                className={cn(inputClass, "mt-1.5")}
              />
              {errors.totalCoinsIos && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.totalCoinsIos.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 text-slate-700">
                Lực Chiến Đội Hình{" "}
                <span className="text-slate-400 font-normal">(Tuỳ chọn)</span>
              </Label>
              <Input
                type="number"
                {...register("teamStrength", {
                  min: { value: 0, message: "Lực chiến phải >= 0" },
                })}
                aria-invalid={!!errors.teamStrength}
                min="0"
                className={cn(inputClass, "mt-1.5")}
              />
              {errors.teamStrength && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.teamStrength.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 text-slate-700">
                Số lượng log{" "}
                <span className="text-slate-400 font-normal">(Tuỳ chọn)</span>
              </Label>
              <Input
                type="number"
                {...register("monthlyLogQuota", {
                  min: { value: 1, message: "Số lượng log phải >= 1" },
                })}
                aria-invalid={!!errors.monthlyLogQuota}
                min="1"
                step="1"
                className={cn(inputClass, "mt-1.5")}
              />
              {errors.monthlyLogQuota && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.monthlyLogQuota.message}
                </p>
              )}
            </div>
          </div>

          {/* Email & Server Region */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-slate-700">
                Email Liên Kết
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (chỉ hiển thị email chưa liên kết)
                </span>
              </Label>
              <select
                {...register("emailId")}
                className={cn(selectClass, "mt-1.5")}
              >
                <option value="">Không có email liên kết</option>
                {availableEmails.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.email_address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-1.5 text-slate-700">
                Server / Vùng
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (eFootball region)
                </span>
              </Label>
              <select
                {...register("serverRegion")}
                className={cn(selectClass, "mt-1.5")}
              >
                <option value="">Chưa chọn</option>
                <option value="Japan">Nhật (Japan)</option>
                <option value="Morocco">Maroc (Morocco)</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Other">Khác</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label className="mb-1.5 text-slate-700">
              Hình Ảnh <span className="text-red-500">*</span>
            </Label>

            <div
              onDragOver={onDragOver}
              onDrop={onDrop}
              tabIndex={0}
              className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 transition-colors hover:border-indigo-500 hover:bg-slate-50 relative outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <UploadCloud
                className="mb-3 h-10 w-10 text-slate-400"
                aria-hidden="true"
              />
              <div className="flex text-sm text-slate-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Tải ảnh lên</span>
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
                <p className="pl-1">hoặc kéo thả vào đây</p>
              </div>
              <p className="text-xs leading-5 text-slate-500 mt-1">
                PNG, JPG, GIF tối đa 5MB
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-sm">
                  Ctrl
                </kbd>
                +
                <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-sm">
                  V
                </kbd>
                để dán ảnh từ clipboard
              </p>
            </div>

            {imageError && (
              <p className="mt-2 text-xs text-red-600">{imageError}</p>
            )}

            {(images.length > 0 || previews.length > 0) && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((img, i) => (
                  <div
                    key={`existing-${i}`}
                    className={`relative aspect-video rounded-xl border-2 bg-slate-50 shadow-sm overflow-hidden ${
                      primaryImage === img
                        ? "border-indigo-500"
                        : "border-slate-200"
                    }`}
                  >
                    {primaryImage === img && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-indigo-600/90 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white shadow-sm backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-current" /> Trình diện
                      </div>
                    )}
                    <img
                      src={img}
                      alt={`Existing account image ${i + 1}`}
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
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="rounded-full bg-red-500/90 p-1.5 text-white shadow-md backdrop-blur-sm hover:bg-red-600"
                        title="Xóa ảnh"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {previews.map((preview, i) => (
                  <div
                    key={`new-${i}`}
                    className={`relative aspect-video rounded-xl border-2 bg-slate-50 shadow-sm overflow-hidden ${
                      primaryImage === preview
                        ? "border-indigo-500"
                        : "border-slate-200"
                    }`}
                  >
                    {primaryImage === preview ? (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-indigo-600/90 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white shadow-sm backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-current" /> Trình diện
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 z-10 rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white shadow-sm backdrop-blur-sm">
                        MỚI
                      </div>
                    )}
                    <img
                      src={preview}
                      alt={`New upload preview ${i + 1}`}
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
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="rounded-full bg-red-500/90 p-1.5 text-white shadow-md backdrop-blur-sm hover:bg-red-600"
                        title="Xóa ảnh"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 border-t border-slate-100 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="h-10 bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? "Đang lưu..."
                : isEditing
                  ? "Cập Nhật Tài Khoản"
                  : "Tạo Tài Khoản"}
            </Button>
            <Button
              variant="outline"
              render={<Link href="/admin/dashboard/accounts" />}
              className="h-10 px-6 text-sm font-medium text-slate-700"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
