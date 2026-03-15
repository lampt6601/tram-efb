import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Plus, SearchCheck, User, Banknote, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccountRequest } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MarkCompleteButton } from "./MarkCompleteButton";

export default async function RequestsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: rows } = await supabase
    .from("account_requests")
    .select("*")
    .order("completed", { ascending: true })
    .order("created_at", { ascending: false });

  const items = (rows ?? []) as AccountRequest[];
  const pendingCount = items.filter((r) => !r.completed).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yêu Cầu Tìm Acc</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} yêu cầu ({pendingCount} chưa xử lý)
          </p>
        </div>
        <Button
          render={<Link href="/admin/dashboard/requests/new" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Yêu Cầu
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-500">Chi Tiết Yêu Cầu</TableHead>
                <TableHead className="text-slate-500">Mức Giá</TableHead>
                <TableHead className="text-slate-500">Người Yêu Cầu</TableHead>
                <TableHead className="text-slate-500">Nền Tảng Liên Hệ</TableHead>
                <TableHead className="text-slate-500">Trạng Thái</TableHead>
                <TableHead className="text-slate-500">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((req) => (
                <TableRow
                  key={req.id}
                  className={req.completed ? "bg-slate-50/50" : "hover:bg-slate-50"}
                >
                  <TableCell>
                    <div className="max-w-[280px]">
                      <span className="text-slate-900">{req.detail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Banknote className="h-4 w-4 text-slate-400" />
                      {req.price_level || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <User className="h-4 w-4 text-slate-400" />
                      {req.requester_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MessageCircle className="h-4 w-4 text-slate-400" />
                      {req.contact_platform}
                    </div>
                  </TableCell>
                  <TableCell>
                    {req.completed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <SearchCheck className="h-3 w-3" />
                        Đã hoàn tất
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
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
                    className="py-12 text-center text-slate-400"
                  >
                    Chưa có yêu cầu nào. Hãy thêm yêu cầu đầu tiên từ khách.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
