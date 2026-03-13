"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { updateMyProfile } from "@/app/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProfileFormProps {
  currentName: string;
  email: string;
}

export function ProfileForm({ currentName, email }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
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
        <Label className="text-slate-700">Email</Label>
        <Input
          type="email"
          value={email}
          disabled
          className="mt-1.5 rounded-xl border-slate-200 bg-slate-50 text-slate-500"
        />
        <p className="mt-1 text-xs text-slate-400">Email không thể thay đổi.</p>
      </div>
      <div>
        <Label className="text-slate-700">Tên hiển thị</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          placeholder="Nguyễn Văn A"
          disabled={loading}
          className="mt-1.5 rounded-xl border-slate-300"
        />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={loading || name.trim() === currentName}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
