"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import Image from "next/image";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@thc-efb/ui/input";
import { Label } from "@thc-efb/ui/label";
import { Button } from "@thc-efb/ui/button";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const isDisabled = searchParams.get("error") === "disabled";
  const [error, setError] = useState(
    isDisabled ? "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ chủ sàn." : "",
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 pt-safe pb-safe">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/avatar-owner.jpeg"
            alt="THC eFootball Shop"
            width={56}
            height={56}
            className="mx-auto mb-4 h-14 w-14 rounded-2xl object-cover shadow-lg shadow-indigo-600/30"
          />
          <h1 className="text-2xl font-bold text-white">Đăng Nhập Quản Trị</h1>
          <p className="mt-1 text-sm text-slate-400">
            Đăng nhập để quản lý cửa hàng của bạn
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="email"
                className="mb-1.5 text-slate-300"
              >
                Email
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Vui lòng nhập email",
                  })}
                  aria-invalid={!!errors.email}
                  className="border-white/10 bg-white/5 py-5 pl-10 pr-4 text-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] autofill:[-webkit-text-fill-color:#e2e8f0]"
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="password"
                className="mb-1.5 text-slate-300"
              >
                Mật khẩu
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                  })}
                  aria-invalid={!!errors.password}
                  className="border-white/10 bg-white/5 py-5 pl-10 pr-4 text-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] autofill:[-webkit-text-fill-color:#e2e8f0]"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            loadingLabel="Đang đăng nhập..."
            className="mt-6 h-11 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Đăng Nhập
          </Button>
        </form>
      </div>
    </div>
  );
}
