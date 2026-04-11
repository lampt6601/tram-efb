import type { Metadata } from "next";
import type { ElementType, ReactNode } from "react";
import {
  BookOpen,
  Mail,
  Gamepad2,
  BadgeDollarSign,
  Tag,
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronRight,
  UserCircle,
  SearchCheck,
  RotateCcw,
  MessageCircle,
  Type,
  AlignLeft,
  Coins,
  Settings2,
  BarChart3,
  Link2,
  ImageIcon,
  Star,
  Keyboard,
  Sparkles,
  Pencil,
} from "lucide-react";

export const revalidate = 3600;

function SectionHeader({
  step,
  icon: Icon,
  title,
  subtitle,
  color = "indigo",
}: {
  step?: number;
  icon: ElementType;
  title: string;
  subtitle?: string;
  color?: "indigo" | "emerald" | "amber" | "blue" | "rose" | "purple" | "slate" | "cyan";
}) {
  const colors = {
    indigo: {
      bg: "bg-indigo-100 dark:bg-indigo-500/20",
      icon: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-600",
      border: "border-indigo-200 dark:border-indigo-500/30",
    },
    emerald: {
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      icon: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-600",
      border: "border-emerald-200 dark:border-emerald-500/30",
    },
    amber: {
      bg: "bg-amber-100 dark:bg-amber-500/20",
      icon: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-500",
      border: "border-amber-200 dark:border-amber-500/30",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-500/20",
      icon: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-600",
      border: "border-blue-200 dark:border-blue-500/30",
    },
    rose: {
      bg: "bg-rose-100 dark:bg-rose-500/20",
      icon: "text-rose-600 dark:text-rose-400",
      badge: "bg-rose-600",
      border: "border-rose-200 dark:border-rose-500/30",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-500/20",
      icon: "text-purple-600 dark:text-purple-400",
      badge: "bg-purple-600",
      border: "border-purple-200 dark:border-purple-500/30",
    },
    slate: {
      bg: "bg-slate-100 dark:bg-slate-700",
      icon: "text-slate-600 dark:text-slate-300",
      badge: "bg-slate-600",
      border: "border-slate-200 dark:border-slate-700",
    },
    cyan: {
      bg: "bg-cyan-100 dark:bg-cyan-500/20",
      icon: "text-cyan-600 dark:text-cyan-400",
      badge: "bg-cyan-600",
      border: "border-cyan-200 dark:border-cyan-500/30",
    },
  };
  const c = colors[color];
  return (
    <div className={`flex items-start gap-3 border-b ${c.border} pb-4 mb-4 sm:gap-4 sm:pb-5 sm:mb-5`}>
      <div className="relative shrink-0">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${c.bg}`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${c.icon}`} />
        </div>
        {step !== undefined && (
          <span
            className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full ${c.badge} text-[10px] font-bold text-white`}
          >
            {step}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoBox({ type, children }: { type: "tip" | "warning" | "info"; children: ReactNode }) {
  const styles = {
    tip: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/30",
      icon: CheckCircle2,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      textColor: "text-emerald-800 dark:text-emerald-300",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/30",
      icon: AlertTriangle,
      iconColor: "text-amber-500 dark:text-amber-400",
      textColor: "text-amber-800 dark:text-amber-300",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/30",
      icon: Info,
      iconColor: "text-blue-500 dark:text-blue-400",
      textColor: "text-blue-800 dark:text-blue-300",
    },
  };
  const s = styles[type];
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border ${s.border} ${s.bg} px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.iconColor}`} />
      <p className={`text-xs leading-relaxed sm:text-sm ${s.textColor}`}>{children}</p>
    </div>
  );
}

function ActionChip({ icon: Icon, label, color = "slate" }: { icon: ElementType; label: string; color?: string }) {
  const colorMap: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${colorMap[color] ?? colorMap.slate}`}
    >
      <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      {label}
    </span>
  );
}

function QuickStartStrip() {
  const items = [
    { href: "#add-email", label: "Thêm email", icon: Mail, color: "blue" },
    { href: "#add-account", label: "Thêm acc", icon: Gamepad2, color: "indigo" },
    { href: "#mark-sold", label: "Đã bán", icon: BadgeDollarSign, color: "emerald" },
  ] as const;

  const ring: Record<string, string> = {
    blue: "ring-blue-200 dark:ring-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-500/15",
    indigo: "ring-indigo-200 dark:ring-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/15",
    emerald: "ring-emerald-200 dark:ring-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-500/15",
  };

  return (
    <nav
      aria-label="Đi nhanh"
      className="sticky top-0 z-10 -mx-1 mb-6 flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/95 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:-mx-0 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2 sm:p-3"
    >
      <p className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 sm:sr-only">
        Đi nhanh
      </p>
      {items.map(({ href, label, icon: Icon, color }) => (
        <a
          key={href}
          href={href}
          className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-800 ring-1 ring-inset transition dark:bg-slate-800 dark:text-slate-100 sm:min-h-0 sm:flex-none sm:py-2.5 ${ring[color]}`}
        >
          <Icon className="h-5 w-5 shrink-0 opacity-80" />
          {label}
        </a>
      ))}
    </nav>
  );
}

function StepFlow({ steps }: { steps: { icon: ElementType; text: string }[] }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2">
      {steps.map(({ icon: Icon, text }, i) => (
        <div key={i} className="flex min-w-0 flex-col items-stretch gap-1 sm:contents">
          <div className="flex min-h-[52px] flex-1 items-start gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/80 sm:max-w-[min(100%,9.5rem)] sm:flex-col sm:items-center sm:text-center sm:px-2 sm:py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300 sm:mb-1">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 items-start gap-2 sm:flex-col sm:items-center">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400 sm:mt-0" />
              <span className="text-xs font-medium leading-snug text-slate-700 dark:text-slate-200">{text}</span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex shrink-0 items-center justify-center py-0.5 sm:self-center sm:py-0" aria-hidden>
              <div className="mx-auto h-3 w-px bg-slate-200 dark:bg-slate-600 sm:hidden" />
              <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 sm:block" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MockFieldLine({
  icon: Icon,
  label,
  badge,
}: {
  icon: ElementType;
  label: string;
  badge: "required" | "optional";
}) {
  return (
    <div className="flex min-h-[40px] items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/90">
      <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-100">
        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="truncate">{label}</span>
      </span>
      <span
        className={
          badge === "required"
            ? "shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
            : "shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-slate-600 dark:text-slate-300"
        }
      >
        {badge === "required" ? "Bắt buộc" : "Tuỳ chọn"}
      </span>
    </div>
  );
}

function MockFormBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function MockAccountCard() {
  return (
    <div className="max-w-[220px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-600 dark:bg-slate-800">
      <div className="mb-2 aspect-[16/7] rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800" />
      <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">Acc Full Legend GP 5M</p>
      <p className="mt-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">500.000 ₫</p>
      <div className="mt-2 flex justify-end">
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
          Tác vụ
          <ChevronDown className="h-3 w-3 opacity-60" />
        </span>
      </div>
    </div>
  );
}

function MockDropdownIllustration() {
  return (
    <div className="min-w-[200px] max-w-[240px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Menu</div>
      {[
        { label: "Chỉnh sửa", dim: true },
        { label: "Xem công khai", dim: true },
        { label: "Copy link", dim: true },
        { label: "Đánh dấu đã bán", highlight: true },
        { label: "Xóa", dim: true },
      ].map((row) => (
        <div
          key={row.label}
          className={
            row.highlight
              ? "mx-1 flex items-center gap-2 rounded-lg bg-emerald-100 px-2.5 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-200"
              : "flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400"
          }
        >
          {row.highlight && <span className="text-emerald-600 dark:text-emerald-400">→</span>}
          {row.label}
        </div>
      ))}
    </div>
  );
}

function CollapsibleGuide({
  id,
  title,
  icon: Icon,
  color,
  children,
  defaultOpen = false,
}: {
  id?: string;
  title: string;
  icon: ElementType;
  color: "amber" | "rose" | "cyan" | "emerald" | "blue" | "slate" | "indigo";
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const iconWrap: Record<string, string> = {
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
  };

  return (
    <details
      id={id}
      open={defaultOpen}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 pr-3 [&::-webkit-details-marker]:hidden sm:p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconWrap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="min-w-0 flex-1 text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">{title}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-slate-100 px-4 pb-5 pt-4 dark:border-slate-700 sm:px-5">{children}</div>
    </details>
  );
}

export const metadata: Metadata = { title: "Hướng Dẫn Sử Dụng" };

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-10 sm:space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
          <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">Hướng dẫn nhanh</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tối ưu cho điện thoại — chạm mục bên dưới để xem đúng phần cần làm.
          </p>
        </div>
      </header>

      <QuickStartStrip />

      {/* ─── 1. Thêm email ─── */}
      <section
        id="add-email"
        className="scroll-mt-24 rounded-2xl border-2 border-blue-200 bg-white p-4 shadow-sm dark:border-blue-500/35 dark:bg-slate-800 sm:p-6"
      >
        <SectionHeader
          step={1}
          icon={Mail}
          title="Thêm email"
          subtitle="Email → Thêm email mới"
          color="blue"
        />
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Thêm trước khi đăng acc — mỗi email chỉ gắn <strong>một acc</strong> tại một thời điểm.
        </p>

        <StepFlow
          steps={[
            { icon: Mail, text: "Mở menu Email" },
            { icon: Sparkles, text: "Thêm email mới" },
            { icon: CheckCircle2, text: "Lưu — xong" },
          ]}
        />

        <div className="mt-5 space-y-4">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Giao diện form</p>
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-4 dark:border-blue-500/30 dark:bg-blue-500/5">
            <MockFormBlock title="Các ô cần nhớ">
              <MockFieldLine icon={Mail} label="Địa chỉ email (đăng nhập game)" badge="required" />
              <MockFieldLine icon={Settings2} label="Mật khẩu email" badge="optional" />
              <MockFieldLine icon={Info} label="Khôi phục (SĐT, câu hỏi...)" badge="optional" />
            </MockFormBlock>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <InfoBox type="tip">
            Khi tạo acc, chọn email ở mục <strong>Liên kết email</strong>. Bán xong, email tự gỡ để dùng lại.
          </InfoBox>
        </div>
      </section>

      {/* ─── 2. Thêm acc ─── */}
      <section
        id="add-account"
        className="scroll-mt-24 rounded-2xl border-2 border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-500/35 dark:bg-slate-800 sm:p-6"
      >
        <SectionHeader
          step={2}
          icon={Gamepad2}
          title="Thêm acc"
          subtitle="Tài khoản → Thêm tài khoản"
          color="indigo"
        />
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Điền nhanh theo nhóm — <strong>ít nhất 1 ảnh</strong>, nhấn ⭐ để chọn ảnh bìa.
        </p>

        <StepFlow
          steps={[
            { icon: Gamepad2, text: "Menu Tài khoản" },
            { icon: Type, text: "Thêm + điền form" },
            { icon: Link2, text: "Chọn email (bước 1)" },
            { icon: ImageIcon, text: "Upload ảnh" },
            { icon: CheckCircle2, text: "Lưu" },
          ]}
        />

        <div className="mt-5">
          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Các nhóm trong form
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 pb-3">
            {["Thông tin", "Giá", "Cài đặt", "Chỉ số", "Liên kết", "Ảnh"].map((t) => (
              <span
                key={t}
                className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MockFormBlock title="Thông tin">
              <MockFieldLine icon={Type} label="Tiêu đề acc" badge="required" />
              <MockFieldLine icon={AlignLeft} label="Mô tả chi tiết" badge="optional" />
            </MockFormBlock>
            <MockFormBlock title="Giá (VNĐ)">
              <MockFieldLine icon={Coins} label="Giá nhập" badge="required" />
              <MockFieldLine icon={Coins} label="Giá bán (≤ 2× nhập)" badge="required" />
              <MockFieldLine icon={Tag} label="Giá gạch (sale)" badge="optional" />
            </MockFormBlock>
            <MockFormBlock title="Cài đặt">
              <MockFieldLine icon={Settings2} label="Trạng thái (Sẵn sàng / ...)" badge="required" />
              <MockFieldLine icon={Sparkles} label="Clone (nếu là clone)" badge="optional" />
            </MockFormBlock>
            <MockFormBlock title="Chỉ số game">
              <MockFieldLine icon={BarChart3} label="GP, coin A/iOS, lực chiến" badge="optional" />
              <MockFieldLine icon={Info} label="Log / tháng" badge="optional" />
            </MockFormBlock>
            <MockFormBlock title="Liên kết">
              <MockFieldLine icon={Mail} label="Email đã thêm" badge="optional" />
              <MockFieldLine icon={Gamepad2} label="Server / vùng" badge="optional" />
            </MockFormBlock>
            <MockFormBlock title="Hình ảnh">
              <MockFieldLine icon={ImageIcon} label="Upload (PNG/JPG, tối đa 4MB)" badge="required" />
              <MockFieldLine icon={Star} label="⭐ Ảnh đại diện" badge="optional" />
              <MockFieldLine icon={Keyboard} label="Ctrl+V dán nhanh" badge="optional" />
            </MockFormBlock>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <InfoBox type="warning">
            Acc mới có thể <strong>chờ duyệt</strong> — chưa lên web cho đến khi chủ sàn duyệt (trừ khi bật auto-approve).
          </InfoBox>
        </div>
      </section>

      {/* ─── 3. Đánh dấu đã bán ─── */}
      <section
        id="mark-sold"
        className="scroll-mt-24 rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-500/35 dark:bg-slate-800 sm:p-6"
      >
        <SectionHeader
          step={3}
          icon={BadgeDollarSign}
          title="Đánh dấu đã bán"
          subtitle="Sau khi khách đã thanh toán & nhận acc"
          color="emerald"
        />
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Làm ngay trên danh sách — nhập <strong>giá thực tế</strong> nếu khác niêm yết.
        </p>

        <StepFlow
          steps={[
            { icon: LayoutDashboard, text: "Vào Tài khoản" },
            { icon: Gamepad2, text: "Tìm acc vừa bán" },
            { icon: ChevronDown, text: "Nút Tác vụ" },
            { icon: BadgeDollarSign, text: "Đánh dấu đã bán + giá" },
          ]}
        />

        <div className="mt-6">
          <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Minh họa thao tác
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex flex-col items-center gap-2">
              <MockAccountCard />
              <span className="text-[10px] font-medium text-slate-400">Thẻ acc trên danh sách</span>
            </div>
            <div className="hidden text-slate-300 dark:text-slate-600 sm:block" aria-hidden>
              <ChevronRight className="h-8 w-8" />
            </div>
            <div className="flex flex-col items-center gap-2 sm:pt-4">
              <MockDropdownIllustration />
              <span className="text-[10px] font-medium text-slate-400">Chọn dòng được tô xanh</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <InfoBox type="info">
            Acc đã bán vẫn hiện mục <strong>Tài khoản đã bán</strong> — tăng uy tín shop.
          </InfoBox>
          <InfoBox type="tip">
            Nhầm? Dùng <strong>Gỡ đánh dấu đã bán</strong> trong cùng menu Tác vụ.
          </InfoBox>
        </div>
      </section>

      {/* ─── Collapsible: phụ ─── */}
      <div className="space-y-3 pt-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Thêm thông tin (mở nếu cần)
        </p>

        <CollapsibleGuide title="Thiết lập giảm giá (Sale)" icon={Tag} color="amber">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tác vụ → <strong>Thiết lập sale</strong>. Giá gạch &gt; giá sale → hiện badge % trên web.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <MockFormBlock title="Sale">
              <MockFieldLine icon={Tag} label="Giá gốc (gạch)" badge="required" />
              <MockFieldLine icon={Coins} label="Giá sale thực tế" badge="required" />
            </MockFormBlock>
          </div>
          <InfoBox type="tip">Sửa / hủy sale bất cứ lúc nào trong Tác vụ.</InfoBox>
        </CollapsibleGuide>

        <CollapsibleGuide title="Theo dõi doanh thu" icon={LayoutDashboard} color="rose">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>Bảng điều khiển</strong> — chỉ số của bạn: tổng acc, sẵn bán, đã bán, doanh thu, chi phí, lợi nhuận.
          </p>
        </CollapsibleGuide>

        <CollapsibleGuide title="Yêu cầu tìm acc" icon={SearchCheck} color="cyan">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Ghi nhanh khách cần gì → <strong>Chưa xử lý</strong> / <strong>Hoàn tất</strong> khi đã chốt.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <MockFormBlock title="Form yêu cầu">
              <MockFieldLine icon={AlignLeft} label="Mô tả acc cần" badge="required" />
              <MockFieldLine icon={Coins} label="Ngân sách" badge="optional" />
              <MockFieldLine icon={UserCircle} label="Tên khách" badge="required" />
              <MockFieldLine icon={MessageCircle} label="Kênh liên hệ" badge="required" />
            </MockFormBlock>
          </div>
        </CollapsibleGuide>

        <CollapsibleGuide title="Hồ sơ cá nhân" icon={UserCircle} color="slate">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>Hồ sơ</strong> — đổi tên hiển thị. Email đăng nhập không đổi (liên hệ chủ sàn nếu cần).
          </p>
        </CollapsibleGuide>

        <CollapsibleGuide title="Quản lý danh sách & Tác vụ" icon={LayoutDashboard} color="slate">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            Lọc theo trạng thái / tìm theo tiêu đề. Sắp xếp: mới–cũ, giá, GP, lực chiến.
          </p>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Một số nút Tác vụ</p>
          <div className="flex flex-wrap gap-2">
            <ActionChip icon={Pencil} label="Chỉnh sửa" color="indigo" />
            <ActionChip icon={BadgeDollarSign} label="Đánh dấu đã bán" color="emerald" />
            <ActionChip icon={RotateCcw} label="Gỡ đã bán" color="blue" />
            <ActionChip icon={Star} label="Nổi bật (tối đa 1 acc sẵn sàng)" color="cyan" />
            <ActionChip icon={Tag} label="Sale" color="amber" />
          </div>
          <InfoBox type="tip">
            <strong>Copy link</strong> / <strong>Xem công khai</strong> — gửi khách nhanh trên Zalo.
          </InfoBox>
        </CollapsibleGuide>

        <CollapsibleGuide title="Quy trình giao dịch an toàn" icon={MessageCircle} color="emerald">
          <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">1.</span>
              Thỏa thuận giá với khách.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">2.</span>
              Tạo nhóm Zalo có <strong>chủ sàn</strong> làm trung gian.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">3.</span>
              Chủ sàn giữ tiền & xác nhận acc trước khi giao.
            </li>
          </ol>
          <InfoBox type="warning">
            Giao dịch không qua chủ sàn — sàn <strong>không chịu trách nhiệm</strong>.
          </InfoBox>
        </CollapsibleGuide>

        <CollapsibleGuide title="Chính sách thu lại acc" icon={RotateCcw} color="blue">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            % tính trên <strong>giá bán</strong>, theo số ngày sau khi bán:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <span className="text-sm text-slate-700 dark:text-slate-300">Ngày đầu</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">80%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
              <span className="text-sm text-slate-700 dark:text-slate-300">1–10 ngày</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">70%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <span className="text-sm text-slate-700 dark:text-slate-300">11–20 ngày</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">65%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-800/80">
              <span className="text-sm text-slate-700 dark:text-slate-300">Từ 21 ngày</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">60%</span>
            </div>
          </div>
          <InfoBox type="info">Khách xem chi tiết trên trang acc (mục thu lại).</InfoBox>
        </CollapsibleGuide>

        <CollapsibleGuide title="Lưu ý quan trọng" icon={AlertTriangle} color="amber">
          <div className="space-y-3">
            <InfoBox type="warning">
              Badge <strong>Chờ duyệt</strong> — nhắn chủ sàn nếu acc chưa lên web.
            </InfoBox>
            <InfoBox type="warning">
              Mỗi thao tác acc có thể gửi <strong>email thông báo</strong> tới chủ sàn (bình thường).
            </InfoBox>
            <InfoBox type="info">
              Bạn chỉ thấy <strong>acc & email của mình</strong> — dữ liệu tách admin.
            </InfoBox>
            <InfoBox type="tip">
              Mật khẩu email là tùy chọn; khi có, lưu dạng text để copy cho khách — nhập đúng, đủ.
            </InfoBox>
          </div>
        </CollapsibleGuide>

        <CollapsibleGuide title="Quy trình A → Z (tóm tắt)" icon={BookOpen} color="indigo">
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">1.</strong> Thêm email →{" "}
              <strong className="text-slate-800 dark:text-slate-200">2.</strong> Thêm acc + ảnh + liên kết email →{" "}
              <strong className="text-slate-800 dark:text-slate-200">3.</strong> Chờ duyệt (nếu có) →{" "}
              <strong className="text-slate-800 dark:text-slate-200">4.</strong> Bán xong →{" "}
              <strong className="text-slate-800 dark:text-slate-200">5.</strong> Tác vụ → Đánh dấu đã bán.
            </li>
          </ol>
        </CollapsibleGuide>
      </div>
    </div>
  );
}
