"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";
import { uploadAdminAvatar, updateMyAvatar } from "@/app/actions/profile-actions";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl: string;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function AvatarUpload({ currentAvatarUrl }: AvatarUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayedAvatar = previewUrl || currentAvatarUrl;

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (jpg, png, webp...)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ảnh quá lớn. Tối đa 4MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadAdminAvatar(formData);
      await updateMyAvatar(url);
      toast.success("Đã cập nhật ảnh đại diện");
      router.refresh();
    } catch (err) {
      setPreviewUrl(null);
      toast.error(err instanceof Error ? err.message : "Tải ảnh lên thất bại.");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await updateMyAvatar(null);
      setPreviewUrl(null);
      toast.success("Đã xóa ảnh đại diện");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        Ảnh đại diện
      </p>
      <div className="flex items-start gap-4">
        <div className="group relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            ) : displayedAvatar ? (
              <Image
                src={displayedAvatar}
                alt="Avatar"
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Camera className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  Tải ảnh
                </span>
              </div>
            )}
          </button>

          {displayedAvatar && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 pt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhấn vào khung để chọn ảnh đại diện.
          </p>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Khuyến nghị ảnh vuông (1:1). Tối đa 4MB. JPG, PNG, WebP.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
}
