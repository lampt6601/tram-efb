"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, Save, X } from "lucide-react";
import {
  updateMySellerProfile,
  uploadSellerAvatar,
} from "@/app/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SellerProfileFormProps {
  current: {
    display_name: string;
    avatar_url: string;
    zalo_link: string;
    facebook_link: string;
  };
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function SellerProfileForm({ current }: SellerProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(current.display_name);
  const [avatarUrl, setAvatarUrl] = useState(current.avatar_url);
  // Extract phone number from zalo link (https://zalo.me/0969347283 → 0969347283)
  const initialPhone = current.zalo_link?.replace(/^https?:\/\/zalo\.me\//, "") ?? "";
  const [zaloPhone, setZaloPhone] = useState(initialPhone);
  const [facebookLink, setFacebookLink] = useState(current.facebook_link);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Preview for newly selected file (before upload completes)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const zaloLink = zaloPhone.trim() ? `https://zalo.me/${zaloPhone.trim()}` : "";

  const hasChanges =
    displayName !== current.display_name ||
    avatarUrl !== current.avatar_url ||
    zaloLink !== (current.zalo_link ?? "") ||
    facebookLink !== current.facebook_link;

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload to ImageKit
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadSellerAvatar(formData);
      setAvatarUrl(url);
      toast.success("Đã tải ảnh lên thành công");
    } catch (err) {
      setPreviewUrl(null);
      toast.error(
        err instanceof Error ? err.message : "Tải ảnh lên thất bại."
      );
    } finally {
      setUploading(false);
      // Clean up blob URL
      URL.revokeObjectURL(localPreview);
    }

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayedAvatar = previewUrl || avatarUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateMySellerProfile({
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        zalo_link: zaloLink.trim() || null,
        facebook_link: facebookLink.trim() || null,
      });
      toast.success("Đã cập nhật hồ sơ người bán thành công");
      setPreviewUrl(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar upload — 1:1 */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200">
          Ảnh đại diện
        </Label>
        <div className="mt-2 flex items-start gap-4">
          <div className="group relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              ) : displayedAvatar ? (
                <Image
                  src={displayedAvatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    Tải ảnh
                  </span>
                </div>
              )}
            </button>

            {/* Remove button */}
            {displayedAvatar && !uploading && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
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
              Khuyến nghị ảnh vuông (1:1). Tối đa 4MB.
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              JPG, PNG, WebP
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleAvatarSelect}
          className="hidden"
        />
      </div>

      {/* Display name */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200">
          Tên hiển thị trên shop
        </Label>
        <Input
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setError("");
          }}
          placeholder="VD: Nguyễn Văn A"
          disabled={loading}
          className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Tên này sẽ hiển thị cho người mua trên trang chi tiết tài khoản.
        </p>
      </div>

      {/* Zalo — phone input, auto-generate link */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200">Số điện thoại Zalo</Label>
        <Input
          type="tel"
          value={zaloPhone}
          onChange={(e) => {
            setZaloPhone(e.target.value.replace(/[^0-9]/g, ""));
            setError("");
          }}
          placeholder="0969347283"
          maxLength={15}
          disabled={loading}
          className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        {zaloPhone.trim() && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Link Zalo: <span className="font-medium text-indigo-500 dark:text-indigo-400">https://zalo.me/{zaloPhone.trim()}</span>
          </p>
        )}
      </div>

      {/* Facebook */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200">
          Link Facebook
        </Label>
        <Input
          type="url"
          value={facebookLink}
          onChange={(e) => {
            setFacebookLink(e.target.value);
            setError("");
          }}
          placeholder="https://facebook.com/username"
          disabled={loading}
          className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={!hasChanges || uploading}
          loading={loading}
          loadingLabel="Đang lưu..."
          className="min-w-[9rem] bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Save className="h-4 w-4 shrink-0" />
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
