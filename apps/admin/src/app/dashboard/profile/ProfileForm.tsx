"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateMyProfile, updateMyZaloName } from "@/app/actions/profile-actions";
import { Button } from "@thc-efb/ui/button";
import { Input } from "@thc-efb/ui/input";
import { Label } from "@thc-efb/ui/label";
import { toast } from "sonner";

interface ProfileFormProps {
  currentName: string;
  email: string;
  currentZaloName?: string;
}

export function ProfileForm({ currentName, email, currentZaloName = "" }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [zaloName, setZaloName] = useState(currentZaloName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateMyProfile(name.trim());
      if (zaloName.trim() !== currentZaloName) {
        await updateMyZaloName(zaloName.trim() || null);
      }
      toast.success("Đã cập nhật hồ sơ thành công");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label className="text-slate-700 dark:text-slate-200">Email</Label>
        <Input
          type="email"
          value={email}
          disabled
          className="mt-1.5 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Email không thể thay đổi.</p>
      </div>
      <div>
        <Label className="text-slate-700 dark:text-slate-200">Tên hiển thị</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          placeholder="Nguyễn Văn A"
          disabled={loading}
          className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
      <div>
        <Label className="text-slate-700 dark:text-slate-200">Tên Zalo</Label>
        <Input
          type="text"
          value={zaloName}
          onChange={(e) => { setZaloName(e.target.value); setError(""); }}
          placeholder="Tên hiển thị trên Zalo"
          disabled={loading}
          className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Tên Zalo sẽ hiển thị trên trang bảo kê. Để trống sẽ dùng tên admin.
        </p>
      </div>
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={name.trim() === currentName && zaloName.trim() === currentZaloName}
          loading={loading}
          loadingLabel="Đang lưu..."
          className="min-w-[9rem] bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Save className="h-4 w-4 shrink-0" />
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
