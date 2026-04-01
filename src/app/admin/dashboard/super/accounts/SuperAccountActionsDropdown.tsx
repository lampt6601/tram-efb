"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  Pencil,
  RotateCcw,
  Trash2,
  Loader2,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  Check,
  CheckCircle,
  Star,
  Copy,
  Tag,
  ShoppingCart,
  Share2,
  Banknote,
} from "lucide-react";
import {
  unapproveAccount,
  superAdminDeleteAccount,
  approveAccount,
  superAdminUpdateAccount,
  buybackAccount,
} from "@/app/actions/super-admin-actions";
import { openFacebookShare } from "@/lib/facebook-share";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PendingAccountDrawer } from "@/app/admin/dashboard/super/pending/PendingAccountDrawer";
import type { AccountWithEmail, Email } from "@/types/database";
import { getBuybackInfo, calculateBuybackPrice } from "@/lib/buyback";
import { formatCurrency } from "@/lib/constants";

interface SuperAccountActionsDropdownProps {
  account: AccountWithEmail;
  adminEmail: string;
  isApproved: boolean;
  isSold: boolean;
  availableEmails: Email[];
}

type OpenDialog = "sell" | "sale" | "unapprove" | "delete" | "unmark-sold" | "deposit" | "undeposit" | "buyback" | null;

export function SuperAccountActionsDropdown({
  account,
  adminEmail,
  isApproved,
  isSold,
  availableEmails,
}: SuperAccountActionsDropdownProps) {
  const id = account.id;
  const title = account.title;
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<"priority" | "clone" | null>(null);
  const [priority, setPriority] = useState(account.is_priority ?? false);
  const [clone, setClone] = useState(account.is_clone ?? false);

  useEffect(() => {
    setPriority(account.is_priority ?? false);
  }, [account.is_priority]);

  useEffect(() => {
    setClone(account.is_clone ?? false);
  }, [account.is_clone]);
  const [sellPrice, setSellPrice] = useState(account.selling_price.toString());
  const [saleOriginalPrice, setSaleOriginalPrice] = useState(
    account.original_price ? account.original_price.toString() : account.selling_price.toString()
  );
  const [salePrice, setSalePrice] = useState(account.selling_price.toString());
  const isOnSale = !!(account.original_price && account.original_price > account.selling_price);
  const isDeposited = account.status === "Deposited";

  // Deposit states
  const [depositCustomerName, setDepositCustomerName] = useState(account.deposit_customer_name ?? "");
  const [depositCustomerContact, setDepositCustomerContact] = useState(account.deposit_customer_contact ?? "");
  const [depositAmount, setDepositAmount] = useState(account.deposit_amount?.toString() ?? "");
  const [depositHoldUntil, setDepositHoldUntil] = useState(account.deposit_hold_until?.split("T")[0] ?? "");
  const [depositNotes, setDepositNotes] = useState(account.deposit_notes ?? "");

  // Buyback states
  const buybackInfo = isSold ? getBuybackInfo(account.updated_at) : null;
  const suggestedBuybackPrice = isSold ? calculateBuybackPrice(account.selling_price, account.updated_at) : 0;
  const [buybackPrice, setBuybackPrice] = useState(suggestedBuybackPrice.toString());
  const [buybackEmailId, setBuybackEmailId] = useState("");

  const closeDialog = useCallback(() => {
    if (!loading) setOpenDialog(null);
  }, [loading]);

  const openWith = (dialog: OpenDialog) => {
    setError("");
    setLoading(false);
    if (dialog === "sell") setSellPrice(account.selling_price.toString());
    if (dialog === "sale") {
      setSaleOriginalPrice(
        account.original_price ? account.original_price.toString() : account.selling_price.toString()
      );
      setSalePrice(account.selling_price.toString());
    }
    if (dialog === "deposit") {
      setDepositCustomerName(account.deposit_customer_name ?? "");
      setDepositCustomerContact(account.deposit_customer_contact ?? "");
      setDepositAmount(account.deposit_amount?.toString() ?? "");
      setDepositHoldUntil(account.deposit_hold_until?.split("T")[0] ?? "");
      setDepositNotes(account.deposit_notes ?? "");
    }
    if (dialog === "buyback") {
      setBuybackPrice(suggestedBuybackPrice.toString());
      setBuybackEmailId(availableEmails[0]?.id ?? "");
    }
    setOpenDialog(dialog);
  };

  // ── Copy link ─────────────────────────────────────────────────────────────
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://thc-efb.com/accounts/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveAccount(id);
      toast.success(`Đã duyệt tài khoản "${title}"`, {
        description: "Chia sẻ acc này lên Facebook của bạn?",
        action: {
          label: "📤 Đăng Facebook",
          onClick: () => openFacebookShare(id, title, account.selling_price),
        },
        duration: 10000,
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setApproving(false); }
  };

  // ── Unapprove ─────────────────────────────────────────────────────────────
  const handleUnapprove = async () => {
    setLoading(true);
    try {
      await unapproveAccount(id);
      toast.success(`Đã chuyển "${title}" về chờ duyệt`);
      setOpenDialog(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setLoading(true);
    try {
      await superAdminDeleteAccount(id);
      toast.success("Đã xóa tài khoản");
      setOpenDialog(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Toggle priority ───────────────────────────────────────────────────────
  const handleTogglePriority = async () => {
    const next = !priority;
    setToggling("priority");
    try {
      await superAdminUpdateAccount(id, account.user_id, { is_priority: next });
      setPriority(next);
      toast.success(next ? "Đã đánh dấu nổi bật" : "Đã bỏ nổi bật");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setToggling(null); }
  };

  // ── Toggle clone ──────────────────────────────────────────────────────────
  const handleToggleClone = async () => {
    const next = !clone;
    setToggling("clone");
    try {
      await superAdminUpdateAccount(id, account.user_id, { is_clone: next });
      setClone(next);
      toast.success(next ? "Đã đánh dấu Clone" : "Đã bỏ Clone");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally { setToggling(null); }
  };

  // ── Sell ──────────────────────────────────────────────────────────────────
  const handleSell = async () => {
    const parsed = parseFloat(sellPrice);
    if (isNaN(parsed) || parsed < 0) {
      setError("Vui lòng nhập giá bán hợp lệ.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, {
        status: "Sold",
        selling_price: parsed,
        email_id: null,
      });
      setOpenDialog(null);
      toast.success("Đã đánh dấu đã bán");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Sale ──────────────────────────────────────────────────────────────────
  const handleSaleConfirm = async () => {
    const parsedOriginal = parseFloat(saleOriginalPrice);
    const parsedSale = parseFloat(salePrice);
    if (isNaN(parsedSale) || parsedSale < 0) {
      setError("Vui lòng nhập giá Sale hợp lệ.");
      return;
    }
    if (saleOriginalPrice !== "" && (isNaN(parsedOriginal) || parsedOriginal <= parsedSale)) {
      setError("Giá gạch phải lớn hơn Giá Sale.");
      return;
    }
    const finalOriginal = saleOriginalPrice !== "" ? parsedOriginal : null;
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, {
        selling_price: parsedSale,
        original_price: finalOriginal,
      });
      setOpenDialog(null);
      toast.success("Đã cập nhật giá sale");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  const handleRemoveSale = async () => {
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, { original_price: null });
      setOpenDialog(null);
      toast.success("Đã hủy sale");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Deposit ──────────────────────────────────────────────────────────────
  const handleDeposit = async () => {
    if (!depositCustomerName.trim()) {
      setError("Vui lòng nhập tên khách hàng.");
      return;
    }
    const parsedAmount = parseFloat(depositAmount);
    if (!depositAmount || isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Vui lòng nhập số tiền cọc hợp lệ.");
      return;
    }
    if (!depositHoldUntil) {
      setError("Vui lòng chọn ngày giữ acc.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, {
        status: "Deposited",
        deposit_customer_name: depositCustomerName.trim(),
        deposit_customer_contact: depositCustomerContact.trim() || null,
        deposit_amount: parsedAmount,
        deposit_hold_until: depositHoldUntil,
        deposit_notes: depositNotes.trim() || null,
      });
      setOpenDialog(null);
      toast.success("Đã đánh dấu cọc thành công");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Undeposit ───────────────────────────────────────────────────────────
  const handleUndeposit = async () => {
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, {
        status: "Available",
        deposit_customer_name: null,
        deposit_customer_contact: null,
        deposit_amount: null,
        deposit_hold_until: null,
        deposit_notes: null,
      });
      setOpenDialog(null);
      toast.success("Đã hủy cọc thành công");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Unmark sold ───────────────────────────────────────────────────────────
  const handleUnmarkSold = async () => {
    setLoading(true);
    setError("");
    try {
      await superAdminUpdateAccount(id, account.user_id, { status: "Available" });
      setOpenDialog(null);
      toast.success("Đã gỡ đánh dấu đã bán");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  // ── Buyback ──────────────────────────────────────────────────────────────
  const handleBuyback = async () => {
    const parsed = parseFloat(buybackPrice);
    if (isNaN(parsed) || parsed < 0) {
      setError("Vui lòng nhập giá thu lại hợp lệ.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await buybackAccount(id, parsed, buybackEmailId || null);
      setOpenDialog(null);
      toast.success("Đã thu lại tài khoản thành công");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100">
              Tác vụ
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            render={
              <Link
                href={`/admin/dashboard/super/accounts/${id}/edit`}
                className="flex items-center gap-2"
              />
            }
          >
            <Pencil className="h-4 w-4 text-slate-400" />
            Chỉnh sửa
          </DropdownMenuItem>

          {isApproved && (
            <DropdownMenuItem
              render={
                <Link
                  href={`/accounts/${id}`}
                  target="_blank"
                  className="flex items-center gap-2"
                />
              }
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              Xem trang công khai
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setDrawerOpen(true)} className="gap-2">
            <Eye className="h-4 w-4 text-indigo-400" />
            Xem chi tiết
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <LinkIcon className="h-4 w-4 text-slate-400" />
            )}
            {copied ? "Đã copy!" : "Copy link"}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => openFacebookShare(id, title, account.selling_price)}
            className="gap-2"
          >
            <Share2 className="h-4 w-4 text-blue-500" />
            Chia sẻ Facebook
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!isSold && (
            <DropdownMenuItem onClick={handleTogglePriority} disabled={toggling !== null} className="gap-2">
              {toggling === "priority" ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              ) : (
                <Star className={`h-4 w-4 ${priority ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
              )}
              {priority ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleToggleClone} disabled={toggling !== null} className="gap-2">
            {toggling === "clone" ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            ) : (
              <Copy className={`h-4 w-4 ${clone ? "text-violet-500" : "text-slate-400"}`} />
            )}
            {clone ? "Bỏ Clone" : "Đánh dấu Clone"}
          </DropdownMenuItem>

          {!isSold && !isDeposited && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openWith("sale")} className="gap-2">
                <Tag className="h-4 w-4 text-rose-400" />
                {isOnSale ? "Chỉnh giá sale" : "Thiết lập sale"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openWith("deposit")} className="gap-2">
                <Banknote className="h-4 w-4 text-blue-500" />
                Cọc acc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openWith("sell")} className="gap-2">
                <ShoppingCart className="h-4 w-4 text-green-500" />
                Đánh dấu đã bán
              </DropdownMenuItem>
            </>
          )}

          {isDeposited && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openWith("undeposit")} className="gap-2">
                <RotateCcw className="h-4 w-4 text-blue-500" />
                Hủy cọc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openWith("sell")} className="gap-2">
                <ShoppingCart className="h-4 w-4 text-green-500" />
                Đánh dấu đã bán
              </DropdownMenuItem>
            </>
          )}

          {isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openWith("buyback")} className="gap-2">
                <RotateCcw className="h-4 w-4 text-emerald-500" />
                Thu lại acc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openWith("unmark-sold")} className="gap-2">
                <RotateCcw className="h-4 w-4 text-blue-500" />
                Gỡ đánh dấu đã bán
              </DropdownMenuItem>
            </>
          )}

          {!isApproved && !isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleApprove}
                disabled={approving}
                className="gap-2"
              >
                {approving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
                {approving ? "Đang duyệt..." : "Duyệt tài khoản"}
              </DropdownMenuItem>
            </>
          )}

          {isApproved && !isSold && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openWith("unapprove")} className="gap-2">
                <RotateCcw className="h-4 w-4 text-amber-500" />
                Chờ duyệt lại
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => openWith("delete")}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa tài khoản
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Unapprove dialog ───────────────────────────────────────────────── */}
      <AlertDialog open={openDialog === "unapprove"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <RotateCcw className="h-5 w-5 text-amber-600" />
            </div>
            <AlertDialogTitle>Chuyển về chờ duyệt</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> sẽ không còn hiển thị công khai và cần được duyệt lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleUnapprove}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[8rem] bg-amber-600 text-white hover:bg-amber-700"
            >
              Xác nhận
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete dialog ──────────────────────────────────────────────────── */}
      <AlertDialog open={openDialog === "delete"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleDelete}
              loading={loading}
              loadingLabel="Đang xóa..."
              className="min-w-[7rem] bg-red-600 text-white hover:bg-red-700"
            >
              Xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Sell dialog ───────────────────────────────────────────────────── */}
      <Dialog open={openDialog === "sell"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <div className="p-5">
            <DialogHeader className="mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <DialogTitle className="text-base font-semibold">Xác Nhận Bán Tài Khoản</DialogTitle>
              <DialogDescription>
                Giá dự kiến sẽ cập nhật thành giá bán thực tế. Email liên kết sẽ bị gỡ tự động.
              </DialogDescription>
            </DialogHeader>
            <Label className="mb-1.5 text-slate-700 dark:text-slate-200">Giá Bán Thực Tế (VNĐ)</Label>
            <Input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              min={0}
              step={1}
              disabled={loading}
              className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
              autoFocus
            />
            {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleSell}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[10rem] bg-green-600 text-white hover:bg-green-700"
            >
              Xác Nhận Bán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Sale dialog ───────────────────────────────────────────────────── */}
      <Dialog open={openDialog === "sale"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <div className="p-5">
            <DialogHeader className="mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10">
                <Tag className="h-5 w-5 text-rose-600" />
              </div>
              <DialogTitle className="text-base font-semibold">Cài Đặt Khuyến Mãi (Sale)</DialogTitle>
              <DialogDescription>
                Thiết lập giá gốc và giá giảm để tạo hiệu ứng thẻ sale nổi bật.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Giá Bị Gạch / Giá Gốc (VNĐ)</Label>
                <Input
                  type="number"
                  value={saleOriginalPrice}
                  onChange={(e) => setSaleOriginalPrice(e.target.value)}
                  min={0}
                  step={1}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                  placeholder="Để trống nếu không có"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Giá Sale Bán Thực Tế (VNĐ)</Label>
                <Input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  min={0}
                  step={1}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-rose-300 bg-rose-50/30 dark:border-rose-500/30 dark:bg-rose-500/10"
                />
              </div>
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>
          <div className="border-t bg-muted/50 p-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
              <Button
                onClick={handleSaleConfirm}
                loading={loading}
                loadingLabel="Đang xử lý..."
                className="min-w-[9rem] bg-rose-600 text-white hover:bg-rose-700"
              >
                Lưu Thay Đổi
              </Button>
            </div>
            {isOnSale && (
              <button
                onClick={handleRemoveSale}
                disabled={loading}
                className="mt-2 w-full rounded-lg py-1.5 text-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline disabled:opacity-50"
              >
                Hủy bỏ sale cho tài khoản này
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Deposit dialog ──────────────────────────────────────────────── */}
      <Dialog open={openDialog === "deposit"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <div className="p-5">
            <DialogHeader className="mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
              <DialogTitle className="text-base font-semibold">Cọc Tài Khoản</DialogTitle>
              <DialogDescription>
                Nhập thông tin khách cọc để giữ acc đến ngày hẹn.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Tên Khách Hàng *</Label>
                <Input
                  value={depositCustomerName}
                  onChange={(e) => setDepositCustomerName(e.target.value)}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                  placeholder="VD: Nguyễn Văn A"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Liên Hệ (SĐT / Zalo / FB)</Label>
                <Input
                  value={depositCustomerContact}
                  onChange={(e) => setDepositCustomerContact(e.target.value)}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                  placeholder="VD: 0901234567"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Số Tiền Cọc (VNĐ) *</Label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="0"
                  step="1"
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-blue-300 bg-blue-50/30 dark:border-blue-500/30 dark:bg-blue-500/10"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Giữ Đến Ngày *</Label>
                <Input
                  type="date"
                  value={depositHoldUntil}
                  onChange={(e) => setDepositHoldUntil(e.target.value)}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-slate-300 dark:border-slate-600"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Ghi Chú</Label>
                <textarea
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  disabled={loading}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:text-slate-200"
                  placeholder="Ghi chú thêm..."
                />
              </div>
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleDeposit}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[10rem] bg-blue-600 text-white hover:bg-blue-700"
            >
              Xác Nhận Cọc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Undeposit dialog ──────────────────────────────────────────────── */}
      <AlertDialog open={openDialog === "undeposit"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <AlertDialogTitle>Hủy Cọc Tài Khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> sẽ được chuyển về trạng thái{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">Đang bán</span> và xóa thông tin cọc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <AlertDialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleUndeposit}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[8rem] bg-blue-600 text-white hover:bg-blue-700"
            >
              Xác Nhận Hủy Cọc
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Unmark sold dialog ─────────────────────────────────────────────── */}
      <AlertDialog open={openDialog === "unmark-sold"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <AlertDialogTitle>Gỡ đánh dấu đã bán</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> sẽ được chuyển về trạng thái Còn hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <AlertDialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleUnmarkSold}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[8rem] bg-blue-600 text-white hover:bg-blue-700"
            >
              Xác nhận
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Buyback dialog ──────────────────────────────────────────────── */}
      <Dialog open={openDialog === "buyback"} onOpenChange={(v) => !loading && !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
          <div className="p-5">
            <DialogHeader className="mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <RotateCcw className="h-5 w-5 text-emerald-600" />
              </div>
              <DialogTitle className="text-base font-semibold">Thu Lại Tài Khoản</DialogTitle>
              <DialogDescription>
                Thu lại <span className="font-semibold text-slate-900 dark:text-slate-100">&quot;{title}&quot;</span> theo chính sách giá thu.
              </DialogDescription>
            </DialogHeader>

            {/* Buyback info */}
            {buybackInfo && (
              <div className="mb-4 space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Giá lúc bán</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(account.selling_price)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Đã bán</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{buybackInfo.days} ngày trước</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Mức thu ({buybackInfo.label})</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{buybackInfo.percent}%</span>
                </div>
                <div className="border-t border-emerald-200 pt-1.5 dark:border-emerald-500/20">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Giá thu gợi ý</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(suggestedBuybackPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Giá Thu Thực Tế (VNĐ)</Label>
                <Input
                  type="number"
                  value={buybackPrice}
                  onChange={(e) => setBuybackPrice(e.target.value)}
                  min={0}
                  step={1}
                  disabled={loading}
                  className="mt-1.5 rounded-xl border-emerald-300 bg-emerald-50/30 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-200">Email Liên Kết</Label>
                <Select value={buybackEmailId || "__none__"} onValueChange={(val) => { if (val !== null) setBuybackEmailId(val === "__none__" ? "" : val) }} disabled={loading}>
                  <SelectTrigger className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                    <SelectValue placeholder="Chọn email">
                      {(value: string) => {
                        if (!value || value === "__none__") return "Không liên kết email";
                        return availableEmails.find((e) => e.id === value)?.email_address ?? value;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Không liên kết email</SelectItem>
                    {availableEmails.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.email_address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>Hủy</Button>
            <Button
              onClick={handleBuyback}
              loading={loading}
              loadingLabel="Đang xử lý..."
              className="min-w-[10rem] bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Xác Nhận Thu Lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      <PendingAccountDrawer
        account={account}
        adminEmail={adminEmail}
        showApproveButton
        controlledOpen={drawerOpen}
        onControlledClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
