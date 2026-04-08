import type { Metadata } from "next";
import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import Link from "next/link";
import { Plus, Mail, Pencil, Link2, Link2Off } from "lucide-react";

export const revalidate = 60; // 1 minute — revalidated on mutations via revalidatePath

export const metadata: Metadata = { title: "Email" };
import { DeleteEmailButton } from "./DeleteButton";
import { EmailFilters } from "./EmailFilters";
import type { AccountWithEmail, Email } from "@thc-efb/supabase/types";
import { LinkedAccountDetailButton } from "./LinkedAccountDetailButton";
import { Button } from "@thc-efb/ui/button";
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

interface EmailWithAccount extends Email {
  accounts: AccountWithEmail | null;
}

type SearchParams = {
  q?: string;
  link?: string;
};

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const searchQuery = params.q ?? "";
  const linkFilter = params.link ?? "all";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("emails")
    .select("*, accounts(*, emails(*))")
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("email_address", `%${searchQuery}%`);
  }

  const { data: emails } = await query;

  let items = (emails ?? []) as EmailWithAccount[];

  // Client-side link filter (Supabase join filtering is limited)
  if (linkFilter === "linked") {
    items = items.filter((e) => e.accounts !== null);
  } else if (linkFilter === "unlinked") {
    items = items.filter((e) => e.accounts === null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Email</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {items.length} email đã đăng ký
          </p>
        </div>
        <Button
          render={<Link href="/dashboard/emails/new" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Email
        </Button>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <Suspense fallback={null}>
          <EmailFilters totalCount={items.length} />
        </Suspense>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sm:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                <TableHead className="text-slate-500 dark:text-slate-400">Địa chỉ Email</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Mật khẩu</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Thông tin khôi phục</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Trạng Thái Liên Kết</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((email) => (
                <TableRow key={email.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {email.email_address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                    {email.password}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {email.recovery_info || "—"}
                  </TableCell>
                  <TableCell>
                    {email.accounts ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <Link2 className="h-3 w-3" />
                          Đã liên kết
                        </span>
                        <LinkedAccountDetailButton account={email.accounts} />
                      </div>
                    ) : (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Link2Off className="h-3 w-3" />
                        Chưa liên kết
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/emails/${email.id}/edit`}
                        className="rounded-lg p-2 text-slate-400 dark:text-slate-500 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteEmailButton id={email.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    Không tìm thấy email nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {items.map((email) => (
          <Card key={email.id} size="sm">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                  <span className="break-all font-medium text-slate-900 dark:text-slate-100 text-sm">
                    {email.email_address}
                  </span>
                </div>
              </CardTitle>
              <CardAction>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/emails/${email.id}/edit`}
                    className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteEmailButton id={email.id} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-y-1.5 text-sm">
              <div className="flex gap-2">
                <span className="shrink-0 text-slate-500 dark:text-slate-400">Mật khẩu:</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{email.password || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 text-slate-500 dark:text-slate-400">Khôi phục:</span>
                <span className="text-slate-700 dark:text-slate-300">{email.recovery_info || "—"}</span>
              </div>
              <div className="mt-1">
                {email.accounts ? (
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <Link2 className="h-3 w-3" />
                      Đã liên kết
                    </span>
                    <LinkedAccountDetailButton account={email.accounts} />
                  </div>
                ) : (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Link2Off className="h-3 w-3" />
                    Chưa liên kết
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
            Không tìm thấy email nào phù hợp với bộ lọc.
          </p>
        )}
      </div>
    </div>
  );
}
