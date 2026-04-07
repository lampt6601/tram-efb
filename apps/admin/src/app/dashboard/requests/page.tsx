import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import Link from "next/link";
import { Plus, SearchCheck, User, Banknote, MessageCircle } from "lucide-react";

export const revalidate = 0; // always fresh

export const metadata: Metadata = { title: "Yêu Cầu Tìm Acc" };
import { Button } from "@thc-efb/ui/button";
import { RequestFilters } from "./RequestFilters";
import type { AccountRequest } from "@thc-efb/supabase/types";
import { Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@thc-efb/ui/table";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@thc-efb/ui/card";
import { MarkCompleteButton } from "./MarkCompleteButton";

type SearchParams = {
  q?: string;
  status?: string;
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const searchQuery = params.q ?? "";
  const statusFilter = params.status ?? "all";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("account_requests")
    .select("id, detail, price_level, requester_name, contact_platform, completed, created_at")
    .order("completed", { ascending: true })
    .order("created_at", { ascending: false });

  if (searchQuery) {
    // Sanitize: escape PostgREST special chars to prevent filter injection
    const sanitized = searchQuery.replace(/[%_\\,().]/g, "");
    if (sanitized) {
      query = query.or(
        `detail.ilike.%${sanitized}%,requester_name.ilike.%${sanitized}%`,
      );
    }
  }

  if (statusFilter === "pending") {
    query = query.eq("completed", false);
  } else if (statusFilter === "completed") {
    query = query.eq("completed", true);
  }

  const { data: rows } = await query;

  const items = (rows ?? []) as AccountRequest[];
  const pendingCount = items.filter((r) => !r.completed).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Yêu Cầu Tìm Acc</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {items.length} yêu cầu ({pendingCount} chưa xử lý)
          </p>
        </div>
        <Button
          render={<Link href="/dashboard/requests/new" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Yêu Cầu
        </Button>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <Suspense fallback={null}>
          <RequestFilters totalCount={items.length} />
        </Suspense>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sm:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                <TableHead className="text-slate-500 dark:text-slate-400">Chi Tiết Yêu Cầu</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Mức Giá</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Người Yêu Cầu</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Nền Tảng Liên Hệ</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Trạng Thái</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((req) => (
                <TableRow
                  key={req.id}
                  className={req.completed ? "bg-slate-50/50 dark:bg-slate-800/50" : "hover:bg-slate-50 dark:hover:bg-slate-700"}
                >
                  <TableCell>
                    <div className="max-w-[280px]">
                      <span className="line-clamp-2 text-slate-900 dark:text-slate-100">{req.detail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                      <Banknote className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      {req.price_level || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                      <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span className="max-w-[120px] truncate">{req.requester_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                      <MessageCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      {req.contact_platform}
                    </div>
                  </TableCell>
                  <TableCell>
                    {req.completed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <SearchCheck className="h-3 w-3" />
                        Đã hoàn tất
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Chưa xử lý
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <MarkCompleteButton id={req.id} completed={req.completed} />
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    Không tìm thấy yêu cầu nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {items.map((req) => (
          <Card key={req.id} size="sm" className={req.completed ? "opacity-70" : ""}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-slate-900 dark:text-slate-100 line-clamp-2">
                {req.detail}
              </CardTitle>
              <CardAction>
                <MarkCompleteButton id={req.id} completed={req.completed} />
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-y-1.5 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  {req.price_level || "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  {req.requester_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  {req.contact_platform}
                </span>
              </div>
              <div className="mt-0.5">
                {req.completed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <SearchCheck className="h-3 w-3" />
                    Đã hoàn tất
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Chưa xử lý
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
            Không tìm thấy yêu cầu nào phù hợp với bộ lọc.
          </p>
        )}
      </div>
    </div>
  );
}
