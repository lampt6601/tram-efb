"use client";

import { useState, useTransition } from "react";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { submitAccountRequest } from "@/app/actions/request-actions";
import {
  Search,
  CheckCircle2,
  Banknote,
  User,
  MessageCircle,
} from "lucide-react";

const CONTACT_PLATFORMS = ["Zalo", "Facebook", "Zalo + Facebook", "Khác"];

export default function RequestPage() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState("");
  const [priceLevel, setPriceLevel] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [contactPlatform, setContactPlatform] = useState("Zalo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!detail.trim() || !requesterName.trim()) {
      setError("Vui lòng nhập chi tiết yêu cầu và tên của bạn.");
      return;
    }

    startTransition(async () => {
      const result = await submitAccountRequest({
        detail,
        priceLevel: priceLevel || undefined,
        requesterName,
        contactPlatform,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Đã gửi yêu cầu!
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Chúng tôi đã nhận yêu cầu tìm acc của bạn. Khi có acc phù hợp,
              chủ sàn sẽ liên hệ bạn qua {contactPlatform}.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Xem acc đang bán
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setDetail("");
                  setPriceLevel("");
                  setRequesterName("");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Gửi yêu cầu khác
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-12">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 sm:mb-4 sm:h-14 sm:w-14 dark:bg-indigo-500/20">
              <Search className="h-6 w-6 text-indigo-600 sm:h-7 sm:w-7 dark:text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">
              Yêu Cầu Tìm Acc
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Chưa tìm được acc ưng ý? Gửi yêu cầu để shop tìm giúp bạn.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6 dark:border-slate-700 dark:bg-slate-800"
          >
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="detail"
                  className="text-slate-700 dark:text-slate-300"
                >
                  <MessageCircle className="mr-1.5 inline h-3.5 w-3.5" />
                  Bạn muốn tìm acc như thế nào?{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <textarea
                  id="detail"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  required
                  maxLength={1000}
                  rows={3}
                  placeholder="VD: Cần acc có Messi, Neymar, GP 3M+, server Japan..."
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 resize-none md:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label
                  htmlFor="priceLevel"
                  className="text-slate-700 dark:text-slate-300"
                >
                  <Banknote className="mr-1.5 inline h-3.5 w-3.5" />
                  Mức giá mong muốn
                </Label>
                <Input
                  id="priceLevel"
                  value={priceLevel}
                  onChange={(e) => setPriceLevel(e.target.value)}
                  placeholder="VD: 100K–300K, dưới 500K..."
                  className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <Label
                  htmlFor="requesterName"
                  className="text-slate-700 dark:text-slate-300"
                >
                  <User className="mr-1.5 inline h-3.5 w-3.5" />
                  Tên của bạn <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="requesterName"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Tên Zalo / Facebook của bạn"
                  className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <Label
                  htmlFor="contactPlatform"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Liên hệ qua <span className="text-rose-500">*</span>
                </Label>
                <Select value={contactPlatform} onValueChange={(val) => { if (val !== null) setContactPlatform(val) }}>
                  <SelectTrigger className="mt-1.5">
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
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="mt-6 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {isPending ? "Đang gửi..." : "Gửi Yêu Cầu"}
            </Button>

            <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
              Miễn phí · Chủ sàn sẽ liên hệ khi có acc phù hợp
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
