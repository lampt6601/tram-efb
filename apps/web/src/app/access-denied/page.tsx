import { CONTACT_ZALO_GROUP_URL, CONTACT_ZALO_URL } from "@thc-efb/shared/constants";
import { Button } from "@thc-efb/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thc-efb/ui/card";
import { LockKeyhole, MessageCircleMore, ShieldCheck } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Card className="w-full max-w-xl border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
            Shop nội bộ - cần link partner hợp lệ
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            Trang bạn truy cập chỉ dành cho khách được mời qua đường link đối tác. Nếu bạn cần vào shop để mua acc,
            liên hệ Admin để được cấp quyền ngay.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <p className="inline-flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Hỗ trợ nhanh cho khách mới
            </p>
            <p className="mt-1">
              Admin có thể cấp link partner đúng theo nhu cầu và ngân sách của bạn chỉ trong vài phút.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <a href={CONTACT_ZALO_URL} target="_blank" rel="noreferrer">
              <Button className="h-10 w-full">
                <MessageCircleMore className="h-4 w-4" />
                Liên hệ Admin Zalo
              </Button>
            </a>
            <a href={CONTACT_ZALO_GROUP_URL} target="_blank" rel="noreferrer">
              <Button variant="outline" className="h-10 w-full">
                Vào nhóm Zalo hỗ trợ
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
