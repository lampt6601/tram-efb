"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitSellRequest } from "@/app/actions/sell-request-actions";
import {
  Upload,
  CheckCircle2,
  ImagePlus,
  X,
  Banknote,
  User,
  MessageCircle,
} from "lucide-react";

const PRICE_OPTIONS = [
  "Dưới 100K",
  "1xx (100K–199K)",
  "2xx trung (200K–299K)",
  "3xx cao (300K–399K)",
  "4xx–5xx (400K–599K)",
  "6xx–9xx (600K–999K)",
  "1M–2M",
  "Trên 2M",
  "Thoả thuận",
];

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function SellPage() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [priceExpectation, setPriceExpectation] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [zaloPhone, setZaloPhone] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);

    for (const file of toAdd) {
      if (!file.type.startsWith("image/")) {
        setError("Chỉ chấp nhận file ảnh.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Mỗi ảnh tối đa 4MB.");
        return;
      }
    }

    setError("");
    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Vui lòng tải lên ít nhất 1 ảnh acc.");
      return;
    }
    if (!priceExpectation) {
      setError("Vui lòng chọn mức giá mong muốn.");
      return;
    }
    if (!sellerName.trim()) {
      setError("Vui lòng nhập tên của bạn.");
      return;
    }
    if (!zaloPhone.trim() || zaloPhone.length < 5) {
      setError("Vui lòng nhập số điện thoại Zalo hợp lệ.");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));
    formData.append("description", description);
    formData.append("priceExpectation", priceExpectation);
    formData.append("sellerName", sellerName.trim());
    formData.append("zaloPhone", zaloPhone.trim());

    startTransition(async () => {
      const result = await submitSellRequest(formData);
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
              Đã gửi thành công!
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Shop đã nhận thông tin acc của bạn. Chúng tôi sẽ liên hệ qua Zalo
              để trao đổi thêm.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Về trang chủ
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setImages([]);
                  setPreviews([]);
                  setDescription("");
                  setPriceExpectation("");
                  setSellerName("");
                  setZaloPhone("");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Gửi acc khác
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 sm:mb-4 sm:h-14 sm:w-14 dark:bg-emerald-500/20">
              <Upload className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">
              Bán Acc Cho Shop
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Đăng ảnh acc của bạn, shop sẽ liên hệ thu mua nhanh chóng
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
              {/* Image upload */}
              <div>
                <Label className="text-slate-700 dark:text-slate-300">
                  <ImagePlus className="mr-1.5 inline h-3.5 w-3.5" />
                  Ảnh acc <span className="text-rose-500">*</span>
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    ({images.length}/{MAX_IMAGES})
                  </span>
                </Label>

                {/* Preview grid */}
                {previews.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {previews.map((src, i) => (
                      <div
                        key={i}
                        className="group relative aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700"
                      >
                        <Image
                          src={src}
                          alt={`Ảnh ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                  >
                    <ImagePlus className="h-5 w-5" />
                    Thêm ảnh
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Chụp màn hình đội hình, GP, coins... Tối đa {MAX_IMAGES} ảnh,
                  mỗi ảnh 4MB
                </p>
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="description"
                  className="text-slate-700 dark:text-slate-300"
                >
                  <MessageCircle className="mr-1.5 inline h-3.5 w-3.5" />
                  Mô tả acc
                </Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={2}
                  placeholder="VD: Acc có Messi, Neymar, GP 3M, coin Android 500K..."
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 resize-none md:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Price expectation */}
              <div>
                <Label
                  htmlFor="priceExpectation"
                  className="text-slate-700 dark:text-slate-300"
                >
                  <Banknote className="mr-1.5 inline h-3.5 w-3.5" />
                  Giá mong muốn <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="priceExpectation"
                  value={priceExpectation}
                  onChange={(e) => setPriceExpectation(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 md:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                >
                  <option value="">Chọn mức giá</option>
                  {PRICE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seller name */}
              <div>
                <Label
                  htmlFor="sellerName"
                  className="text-slate-700 dark:text-slate-300"
                >
                  <User className="mr-1.5 inline h-3.5 w-3.5" />
                  Tên của bạn <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="sellerName"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Tên Zalo của bạn"
                  className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Zalo phone */}
              <div>
                <Label
                  htmlFor="zaloPhone"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Số điện thoại Zalo <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="zaloPhone"
                  type="tel"
                  value={zaloPhone}
                  onChange={(e) =>
                    setZaloPhone(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  required
                  maxLength={15}
                  placeholder="0969347283"
                  className="mt-1.5 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                />
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Shop sẽ liên hệ bạn qua Zalo để trao đổi giá
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="mt-6 h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              {isPending ? "Đang gửi..." : "Gửi Cho Shop Xem"}
            </Button>

            <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
              Miễn phí · Shop sẽ liên hệ trong 24h nếu quan tâm
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
