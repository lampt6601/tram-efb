"use client";

import { useState } from "react";
import { Send, MessageCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendZaloMessage } from "@/app/actions/zalo-bot-actions";

export default function ZaloBotPage() {
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    Array<{ text: string; photoUrl?: string; time: string; success: boolean }>
  >([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Vui lòng nhập nội dung tin nhắn.");
      return;
    }

    setLoading(true);
    try {
      const result = await sendZaloMessage(
        message.trim(),
        photoUrl.trim() || undefined,
      );
      if (result.ok) {
        toast.success("Đã gửi tin nhắn thành công!");
        setHistory((prev) => [
          {
            text: message.trim(),
            photoUrl: photoUrl.trim() || undefined,
            time: new Date().toLocaleTimeString("vi-VN"),
            success: true,
          },
          ...prev,
        ]);
        setMessage("");
        setPhotoUrl("");
      } else {
        toast.error(result.error || "Gửi tin nhắn thất bại.");
        setHistory((prev) => [
          {
            text: message.trim(),
            photoUrl: photoUrl.trim() || undefined,
            time: new Date().toLocaleTimeString("vi-VN"),
            success: false,
          },
          ...prev,
        ]);
      }
    } catch {
      toast.error("Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
          <MessageCircle className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Zalo Bot</h1>
          <p className="text-sm text-slate-500">
            Gửi tin nhắn thông báo qua Zalo Bot
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Gửi tin nhắn</h2>
        </div>

        <form onSubmit={handleSend} className="space-y-4 p-6">
          <div>
            <Label className="text-slate-700">Nội dung tin nhắn</Label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập nội dung tin nhắn..."
              disabled={loading}
              rows={4}
              maxLength={2000}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-400">
              {message.length}/2000 ký tự
            </p>
          </div>

          <div>
            <Label className="text-slate-700">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                URL hình ảnh (tuỳ chọn)
              </span>
            </Label>
            <Input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
              className="mt-1.5 rounded-xl border-slate-300"
            />
            <p className="mt-1 text-xs text-slate-400">
              Nếu có URL hình ảnh, bot sẽ gửi kèm ảnh. Nếu không, chỉ gửi văn
              bản.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={!message.trim() || loading}
              loading={loading}
              loadingLabel="Đang gửi..."
              className="min-w-[9rem] rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              <Send className="h-4 w-4 shrink-0" />
              Gửi tin nhắn
            </Button>
          </div>
        </form>
      </div>

      {/* Message history */}
      {history.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Lịch sử gửi ({history.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {history.map((item, i) => (
              <div key={i} className="px-6 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap break-words flex-1">
                    {item.text}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-400">{item.time}</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.success
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.success ? "OK" : "Lỗi"}
                    </span>
                  </div>
                </div>
                {item.photoUrl && (
                  <p className="mt-1 truncate text-xs text-blue-500">
                    📷 {item.photoUrl}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
