import { Card, CardDescription, CardHeader, CardTitle } from "@thc-efb/ui/card";
import { LockKeyhole } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Card className="w-full max-w-md border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
            Web nội bộ
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            Đây là web nội bộ. Chỉ truy cập được khi bạn thuộc nội bộ và có quyền truy cập.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
