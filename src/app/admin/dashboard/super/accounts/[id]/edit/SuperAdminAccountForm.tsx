"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ArrowLeft, Loader2, X, UploadCloud, Star, Copy } from "lucide-react";
import Link from "next/link";
import type { Account, Email, AccountStatus } from "@/types/database";
import { useForm, Controller } from "react-hook-form";
import { superAdminUpdateAccount } from "@/app/actions/super-admin-actions";
import { uploadImageAction } from "@/app/actions/upload-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  account: Account;
  availableEmails: Email[];
}

type FormValues = {
  title: string;
  purchasePrice: string;
  sellingPrice: string;
  originalPrice: string;
  status: AccountStatus;
  totalGp: string;
  totalCoinsAndroid: string;
  totalCoinsIos: string;
  teamStrength: string;
  monthlyLogQuota: string;
  serverRegion: string;
  emailId: string;
  isPriority: boolean;
  isClone: boolean;
};

const inputClass = "w-full rounded-xl border-slate-300 px-4 py-2.5 text-sm focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";
const selectClass = "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white";

export function SuperAdminAccountForm({ account, availableEmails }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [images, setImages] = useState<string[]>(account.images ?? []);
  const [primaryImage, setPrimaryImage] = useState<string | null>(
    account.primary_image_url ?? account.images?.[0] ?? null
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const defaultValues = useMemo<FormValues>(() => ({
    title: account.title ?? "",
    purchasePrice: account.purchase_price?.toString() ?? "",
    sellingPrice: account.selling_price?.toString() ?? "",
    originalPrice: account.original_price?.toString() ?? "",
    status: account.status ?? "Available",
    totalGp: account.total_gp?.toString() ?? "",
    totalCoinsAndroid: account.total_coins_android?.toString() ?? "",
    totalCoinsIos: account.total_coins_ios?.toString() ?? "",
    teamStrength: account.team_strength?.toString() ?? "",
    monthlyLogQuota: account.monthly_log_quota?.toString() ?? "",
    serverRegion: account.server_region ?? "",
    emailId: account.email_id ?? "",
    isPriority: account.is_priority ?? false,
    isClone: account.is_clone ?? false,
  }), [account]);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({ defaultValues });

  const addImageFiles = (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setSelectedFiles((p) => [...p, ...imgs]);
    setPreviews((p) => [...p, ...imgs.map((f) => URL.createObjectURL(f))]);
  };

  useEffect(() => {
    const fn = (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      addImageFiles(Array.from(e.clipboardData?.files ?? []));
    };
    window.addEventListener("paste", fn);
    return () => window.removeEventListener("paste", fn);
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (images.length === 0 && selectedFiles.length === 0) {
      setImageError("Vui lòng tải lên ít nhất 1 hình ảnh");
      return;
    }
    setImageError("");
    setLoading(true);

    try {
      const uploadedUrls: string[] = [];
      let finalPrimaryUrl = primaryImage;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fd = new FormData();
        fd.append("file", file);
        const publicUrl = await uploadImageAction(fd);
        uploadedUrls.push(publicUrl);
        if (primaryImage === previews[i]) finalPrimaryUrl = publicUrl;
      }

      const finalImages = [...images, ...uploadedUrls];
      if (!finalImages.includes(finalPrimaryUrl as string) && finalImages.length > 0) finalPrimaryUrl = finalImages[0];
      else if (finalImages.length === 0) finalPrimaryUrl = null;

      await superAdminUpdateAccount(account.id, account.user_id, {
        title: values.title,
        purchase_price: parseInt(values.purchasePrice) || 0,
        selling_price: parseInt(values.sellingPrice) || 0,
        original_price: values.originalPrice ? parseInt(values.originalPrice) : null,
        status: values.status,
        total_gp: parseInt(values.totalGp) || 0,
        total_coins_android: parseInt(values.totalCoinsAndroid) || 0,
        total_coins_ios: parseInt(values.totalCoinsIos) || 0,
        team_strength: parseInt(values.teamStrength) || 0,
        server_region: values.serverRegion || null,
        monthly_log_quota: values.monthlyLogQuota ? parseInt(values.monthlyLogQuota) : null,
        email_id: values.emailId || null,
        is_priority: values.isPriority,
        is_clone: values.isClone,
        images: finalImages,
        primary_image_url: finalPrimaryUrl,
      });

      toast.success("Đã cập nhật tài khoản thành công");
      router.push("/admin/dashboard/super/accounts");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu.");
      setLoading(false);
    }
  };

  const isPriorityValue = watch("isPriority");
  const isCloneValue = watch("isClone");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/dashboard/super/accounts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-amber-600">
        <ArrowLeft className="h-4 w-4" /> Quay lại Tất Cả Tài Khoản
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Star className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Chỉnh Sửa Tài Khoản</h1>
            <p className="text-xs text-amber-600">Super Admin — quyền chỉnh sửa toàn bộ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label className="mb-1.5 text-slate-700">Tiêu Đề <span className="text-red-500">*</span></Label>
            <Input {...register("title", { required: "Vui lòng nhập tiêu đề" })} className={cn(inputClass, "mt-1.5")} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "purchasePrice" as const, label: "Giá Nhập (VNĐ)", required: true },
              { name: "sellingPrice" as const, label: "Giá Bán (VNĐ)", required: true },
              { name: "originalPrice" as const, label: "Giá Bị Gạch", required: false },
            ].map(({ name, label, required }) => (
              <div key={name}>
                <Label className="mb-1.5 text-slate-700">
                  {label} {required && <span className="text-red-500">*</span>}
                  {!required && <span className="ml-1 text-slate-400 font-normal text-xs">(Tuỳ chọn)</span>}
                </Label>
                <Input type="number" {...register(name, {
                  required: required ? `Vui lòng nhập ${label.toLowerCase()}` : false,
                  min: { value: 0, message: "Phải >= 0" },
                  ...(name === "originalPrice" ? {
                    validate: (v, f) => !v || parseInt(v) > parseInt(f.sellingPrice) || "Phải lớn hơn giá bán"
                  } : {})
                })} min="0" step="1" className={cn(inputClass, "mt-1.5")}
                  placeholder={!required ? "Để trống nếu không sale" : undefined} />
                {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]?.message}</p>}
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-slate-700">Trạng Thái <span className="text-red-500">*</span></Label>
              <select {...register("status")} className={cn(selectClass, "mt-1.5")}>
                <option value="Available">Sẵn Sàng</option>
                <option value="Pending">Đang Chờ</option>
                <option value="Sold">Đã Bán</option>
              </select>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <Label className="mb-1.5 hidden text-slate-700 sm:flex">Tùy Chọn Khác</Label>
              <div className="flex h-[42px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 mt-1.5">
                <Controller name="isPriority" control={control}
                  render={({ field }) => (
                    <Checkbox id="isPriority" checked={field.value} onCheckedChange={field.onChange} />
                  )} />
                <label htmlFor="isPriority"
                  className="flex flex-1 cursor-pointer items-center justify-between gap-1.5 text-sm font-medium text-slate-700 select-none">
                  Tài Khoản Nổi Bật
                  <Star className={`h-4 w-4 ${isPriorityValue ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                </label>
              </div>
              <div className="flex h-[42px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
                <Controller name="isClone" control={control}
                  render={({ field }) => (
                    <Checkbox id="isClone" checked={field.value} onCheckedChange={field.onChange} />
                  )} />
                <label htmlFor="isClone"
                  className="flex flex-1 cursor-pointer items-center justify-between gap-1.5 text-sm font-medium text-slate-700 select-none">
                  Tài Khoản Clone
                  <Copy className={`h-4 w-4 ${isCloneValue ? "text-violet-500" : "text-slate-400"}`} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {([
              { name: "totalGp", label: "Tổng GP", min: 0 },
              { name: "totalCoinsAndroid", label: "Coins (Android)", min: 0 },
              { name: "totalCoinsIos", label: "Coins (iOS)", min: 0 },
              { name: "teamStrength", label: "Lực Chiến", min: 0 },
              { name: "monthlyLogQuota", label: "Số lượng log", min: 1 },
            ] as const).map(({ name, label, min }) => (
              <div key={name}>
                <Label className="mb-1.5 text-slate-700">{label} <span className="text-slate-400 font-normal text-xs">(Tuỳ chọn)</span></Label>
                <Input type="number" {...register(name, { min: { value: min, message: `Phải >= ${min}` } })}
                  min={min} step="1" className={cn(inputClass, "mt-1.5")} />
                {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]?.message}</p>}
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-slate-700">
                Email Liên Kết <span className="ml-1 text-xs font-normal text-slate-400">(chỉ email chưa liên kết)</span>
              </Label>
              <select {...register("emailId")} className={cn(selectClass, "mt-1.5")}>
                <option value="">Không có email liên kết</option>
                {availableEmails.map((e) => <option key={e.id} value={e.id}>{e.email_address}</option>)}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 text-slate-700">Server / Vùng</Label>
              <select {...register("serverRegion")} className={cn(selectClass, "mt-1.5")}>
                <option value="">Chưa chọn</option>
                <option value="Japan">Nhật (Japan)</option>
                <option value="Morocco">Maroc (Morocco)</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Other">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 text-slate-700">Hình Ảnh <span className="text-red-500">*</span></Label>
            <div onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addImageFiles(Array.from(e.dataTransfer.files)); }}
              className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 hover:border-indigo-500 hover:bg-slate-50">
              <UploadCloud className="mb-3 h-10 w-10 text-slate-400" />
              <div className="flex text-sm text-slate-600">
                <label htmlFor="sa-file-upload"
                  className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500">
                  <span>Tải ảnh lên</span>
                  <input id="sa-file-upload" type="file" multiple accept="image/*" className="sr-only"
                    onChange={(e) => { if (e.target.files) addImageFiles(Array.from(e.target.files)); }} />
                </label>
                <p className="pl-1">hoặc kéo thả vào đây</p>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm">Ctrl</kbd>+
                <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm">V</kbd>
                để dán ảnh từ clipboard
              </p>
            </div>
            {imageError && <p className="mt-2 text-xs text-red-600">{imageError}</p>}

            {(images.length > 0 || previews.length > 0) && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((img, i) => (
                  <div key={`e-${i}`} className={`relative aspect-video rounded-xl border-2 overflow-hidden ${primaryImage === img ? "border-indigo-500" : "border-slate-200"}`}>
                    {primaryImage === img && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-indigo-600/90 px-2 py-0.5 text-[10px] font-medium text-white">
                        <Star className="h-3 w-3 fill-current" /> Trình diện
                      </div>
                    )}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
                      {primaryImage !== img && (
                        <button type="button" onClick={() => setPrimaryImage(img)}
                          className="rounded-full bg-white/90 p-1.5 text-indigo-600 shadow-md hover:bg-white">
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button"
                        onClick={() => { if (primaryImage === img) setPrimaryImage(null); setImages(images.filter((_, idx) => idx !== i)); }}
                        className="rounded-full bg-red-500/90 p-1.5 text-white shadow-md hover:bg-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {previews.map((preview, i) => (
                  <div key={`n-${i}`} className={`relative aspect-video rounded-xl border-2 overflow-hidden ${primaryImage === preview ? "border-indigo-500" : "border-slate-200"}`}>
                    <div className="absolute top-2 left-2 z-10 rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-white">
                      {primaryImage === preview ? "Trình diện" : "MỚI"}
                    </div>
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                    <div className="absolute bottom-2 right-2 z-20 flex gap-1.5">
                      {primaryImage !== preview && (
                        <button type="button" onClick={() => setPrimaryImage(preview)}
                          className="rounded-full bg-white/90 p-1.5 text-indigo-600 shadow-md hover:bg-white">
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button"
                        onClick={() => { if (primaryImage === preview) setPrimaryImage(null); setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i)); setPreviews(previews.filter((_, idx) => idx !== i)); }}
                        className="rounded-full bg-red-500/90 p-1.5 text-white shadow-md hover:bg-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-6">
            <Button type="submit" disabled={loading}
              className="h-10 bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Đang lưu..." : "Cập Nhật Tài Khoản"}
            </Button>
            <Button type="button" variant="outline"
              onClick={() => router.push("/admin/dashboard/super/accounts")}
              className="h-10 px-6 text-sm text-slate-700">
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
