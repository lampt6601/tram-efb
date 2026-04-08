"use client";

import { useState } from "react";
import { Eye, Gamepad2 } from "lucide-react";
import { formatCurrency } from "@thc-efb/shared/constants";
import { ReviewAccountDialog, type PendingAccount } from "./ReviewAccountDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@thc-efb/ui/table";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@thc-efb/ui/card";

export function PendingReviewList({ accounts, isSuperAdmin = false }: { accounts: PendingAccount[]; isSuperAdmin?: boolean }) {
  const [selected, setSelected] = useState<PendingAccount | null>(null);

  return (
    <>
      {/* ── Desktop table ──────────────────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sm:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                <TableHead className="text-slate-500 dark:text-slate-400">Tài Khoản</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Người Bán</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Giá Bán</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 md:table-cell">GP / Sức Mạnh</TableHead>
                <TableHead className="hidden text-slate-500 dark:text-slate-400 lg:table-cell">Ngày Tạo</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Chi Tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow
                  key={account.id}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => setSelected(account)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {account.primary_image_url ?? account.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={account.primary_image_url ?? account.images[0]}
                          alt={account.title}
                          className="h-10 w-14 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                          <Gamepad2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                        </div>
                      )}
                      <span className="line-clamp-2 font-medium text-slate-900 dark:text-slate-100">
                        {account.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {account.seller_name ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(account.selling_price)}
                  </TableCell>
                  <TableCell className="hidden text-slate-500 dark:text-slate-400 md:table-cell">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span>⚡ {account.total_gp?.toLocaleString()} GP</span>
                      <span>💪 {account.team_strength}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs text-slate-400 dark:text-slate-500 lg:table-cell">
                    {new Date(account.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelected(account)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Chi tiết
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Mobile card list ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {accounts.map((account) => (
          <Card key={account.id} size="sm">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2.5">
                  {account.primary_image_url ?? account.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={account.primary_image_url ?? account.images[0]}
                      alt={account.title}
                      className="h-9 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                      <Gamepad2 className="h-4 w-4 text-indigo-500" />
                    </div>
                  )}
                  <span className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {account.title}
                  </span>
                </div>
              </CardTitle>
              <CardAction>
                <button
                  onClick={() => setSelected(account)}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Xem
                </button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-slate-500 dark:text-slate-400">
                {account.seller_name ?? "—"}
              </div>
              <div className="font-medium text-indigo-600 dark:text-indigo-400">
                {formatCurrency(account.selling_price)}
              </div>
              <div className="text-xs text-slate-400">⚡ {account.total_gp?.toLocaleString()} GP</div>
              <div className="text-xs text-slate-400">💪 {account.team_strength}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Single dialog, swaps account on selection ──────────────────────── */}
      {selected && (
        <ReviewAccountDialog
          account={selected}
          adminName={selected.seller_name ?? ""}
          isSuperAdmin={isSuperAdmin}
          open={!!selected}
          onOpenChange={(open) => { if (!open) setSelected(null); }}
        />
      )}
    </>
  );
}
