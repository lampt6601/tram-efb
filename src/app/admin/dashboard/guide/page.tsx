import {
  BookOpen,
  Mail,
  Gamepad2,
  ListFilter,
  BadgeDollarSign,
  Tag,
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  ImageIcon,
  Link2,
  UserCircle,
  Star,
  Copy,
  Trash2,
  Pencil,
} from "lucide-react";

function SectionHeader({
  step,
  icon: Icon,
  title,
  subtitle,
  color = "indigo",
}: {
  step?: number;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: "indigo" | "emerald" | "amber" | "blue" | "rose" | "purple" | "slate";
}) {
  const colors = {
    indigo: { bg: "bg-indigo-100", icon: "text-indigo-600", badge: "bg-indigo-600", border: "border-indigo-200" },
    emerald: { bg: "bg-emerald-100", icon: "text-emerald-600", badge: "bg-emerald-600", border: "border-emerald-200" },
    amber: { bg: "bg-amber-100", icon: "text-amber-600", badge: "bg-amber-500", border: "border-amber-200" },
    blue: { bg: "bg-blue-100", icon: "text-blue-600", badge: "bg-blue-600", border: "border-blue-200" },
    rose: { bg: "bg-rose-100", icon: "text-rose-600", badge: "bg-rose-600", border: "border-rose-200" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600", badge: "bg-purple-600", border: "border-purple-200" },
    slate: { bg: "bg-slate-100", icon: "text-slate-600", badge: "bg-slate-600", border: "border-slate-200" },
  };
  const c = colors[color];
  return (
    <div className={`flex items-start gap-4 border-b ${c.border} pb-4 mb-6`}>
      <div className="relative shrink-0">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`h-6 w-6 ${c.icon}`} />
        </div>
        {step !== undefined && (
          <span className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full ${c.badge} text-[10px] font-bold text-white`}>
            {step}
          </span>
        )}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldRow({ label, desc, required }: { label: string; desc: string; required?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-1.5 min-w-[180px] shrink-0">
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {required && (
          <span className="text-[10px] font-bold text-rose-500 uppercase">*</span>
        )}
      </div>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
}

function InfoBox({ type, children }: { type: "tip" | "warning" | "info"; children: React.ReactNode }) {
  const styles = {
    tip: { bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2, iconColor: "text-emerald-500", textColor: "text-emerald-800" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, iconColor: "text-amber-500", textColor: "text-amber-800" },
    info: { bg: "bg-blue-50", border: "border-blue-200", icon: Info, iconColor: "text-blue-500", textColor: "text-blue-800" },
  };
  const s = styles[type];
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-3 rounded-xl border ${s.border} ${s.bg} px-4 py-3`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.iconColor}`} />
      <p className={`text-sm ${s.textColor}`}>{children}</p>
    </div>
  );
}

function ActionChip({ icon: Icon, label, color = "slate" }: { icon: React.ElementType; label: string; color?: string }) {
  const colorMap: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colorMap[color] ?? colorMap.slate}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-2">
      {/* Page header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <BookOpen className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hướng Dẫn Sử Dụng</h1>
          <p className="text-sm text-slate-500">Dành cho admin mới — đọc kỹ trước khi bắt đầu</p>
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader icon={LayoutDashboard} title="Tổng Quan Hệ Thống" subtitle="Bạn có thể làm gì với trang quản trị này?" color="slate" />
        <p className="mb-4 text-sm text-slate-600 leading-relaxed">
          Đây là hệ thống giúp bạn <strong>đăng bán tài khoản eFootball</strong> lên website <strong>THC eFootball Shop</strong> một cách nhanh chóng, có tổ chức. Thay vì tự repost bài mỗi ngày trên group Facebook, tài khoản của bạn sẽ được hiển thị 24/7 trên web và khách hàng tự tìm đến mua.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Mail, label: "Quản lý Email", desc: "Lưu thông tin email game để liên kết với acc" },
            { icon: Gamepad2, label: "Đăng Acc", desc: "Thêm, chỉnh sửa, đánh dấu đã bán" },
            { icon: LayoutDashboard, label: "Xem Thống Kê", desc: "Theo dõi doanh thu & lợi nhuận" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <Icon className="mb-2 h-5 w-5 text-indigo-500" />
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 — Email */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          step={1}
          icon={Mail}
          title="Thêm Email Trước Khi Đăng Acc"
          subtitle="Menu: Email → Thêm Email Mới"
          color="blue"
        />
        <p className="mb-4 text-sm text-slate-600 leading-relaxed">
          Mỗi tài khoản game đều có một <strong>email đăng nhập</strong> đi kèm. Bạn cần thêm email này vào hệ thống trước, sau đó mới có thể liên kết nó với acc khi đăng bán.
        </p>

        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
          <FieldRow label="Địa chỉ Email" desc="Email đăng nhập vào tài khoản game" required />
          <FieldRow label="Mật khẩu" desc="Mật khẩu email (hiển thị plain text — dùng để cung cấp cho khách sau khi bán)" required />
          <FieldRow label="Thông tin khôi phục" desc="Số điện thoại backup, câu hỏi bảo mật, v.v. (không bắt buộc)" />
        </div>

        <InfoBox type="tip">
          Sau khi tạo xong email, khi đăng acc bạn sẽ chọn email này ở mục <strong>Liên kết Email</strong>. Một email chỉ được liên kết với <strong>một acc</strong> tại một thời điểm.
        </InfoBox>
      </div>

      {/* Step 2 — Create Account */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          step={2}
          icon={Gamepad2}
          title="Đăng Tài Khoản Mới"
          subtitle="Menu: Tài Khoản → Thêm Tài Khoản"
          color="indigo"
        />

        <div className="mb-5 space-y-5">
          {/* Thông tin */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Thông tin</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
              <FieldRow label="Tiêu đề" desc='Tên hiển thị của acc. Ví dụ: "Acc Full Legend GP 5000 Server Nhật"' required />
            </div>
          </div>

          {/* Giá */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Giá (VNĐ)</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
              <FieldRow label="Giá nhập" desc="Giá bạn bỏ ra mua acc (dùng để tính lợi nhuận, khách không thấy)" required />
              <FieldRow label="Giá bán" desc="Giá hiển thị trên web cho khách mua" required />
              <FieldRow label="Giá gốc (gạch)" desc="Điền nếu muốn hiển thị kiểu giảm giá. Phải lớn hơn giá bán. Ví dụ: gốc 500K → bán 350K" />
            </div>
          </div>

          {/* Cài đặt */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Cài đặt</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
              <FieldRow label="Trạng thái" desc='"Available" = đang bán, "Pending" = tạm giữ, "Sold" = đã bán' required />
              <FieldRow label="Nổi bật ⭐" desc="Tích vào để acc được ghim lên đầu trang chủ với biểu tượng ngôi sao" />
              <FieldRow label="Clone" desc="Tích nếu đây là acc clone (hiển thị tag riêng, khách có thể lọc)" />
            </div>
          </div>

          {/* Chỉ số */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Chỉ số game</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
              <FieldRow label="GP" desc="Tổng số GP của acc" />
              <FieldRow label="Coins Android / iOS" desc="Số coin của từng nền tảng" />
              <FieldRow label="Lực chiến" desc="Team Strength của đội hình" />
              <FieldRow label="Số lượng log / tháng" desc="Số lần đăng nhập cho phép mỗi tháng (mặc định: 10)" />
            </div>
          </div>

          {/* Liên kết */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Liên kết</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
              <FieldRow
                label="Email"
                desc="Chọn email đã thêm ở Bước 1. Khi bán, email này sẽ được gỡ liên kết để dùng lại sau."
              />
              <FieldRow
                label="Server / Vùng"
                desc="Nhật, Maroc, Hong Kong, Khác — giúp khách lọc theo server"
              />
            </div>
          </div>

          {/* Hình ảnh */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Hình ảnh</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
              <FieldRow label="Upload ảnh" desc="Kéo thả hoặc nhấn chọn file (PNG, JPG, GIF — tối đa 5MB/ảnh). Phải có ít nhất 1 ảnh." required />
              <FieldRow label="Ảnh đại diện" desc='Nhấn biểu tượng ⭐ trên ảnh để đặt làm ảnh thumbnail chính hiển thị ở trang chủ' />
              <FieldRow label="Ctrl + V" desc="Dán ảnh từ clipboard thẳng vào form (nhanh hơn kéo thả)" />
            </div>
          </div>
        </div>

        <InfoBox type="warning">
          Tài khoản mới đăng sẽ ở trạng thái <strong>chờ duyệt</strong> nếu chủ shop chưa bật auto-approve cho bạn. Acc sẽ <strong>chưa hiển thị</strong> trên web cho đến khi được duyệt.
        </InfoBox>
      </div>

      {/* Step 3 — Manage accounts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          step={3}
          icon={ListFilter}
          title="Quản Lý Danh Sách Tài Khoản"
          subtitle="Menu: Tài Khoản"
          color="purple"
        />
        <p className="mb-4 text-sm text-slate-600 leading-relaxed">
          Trang danh sách hiển thị tất cả acc của bạn với các công cụ lọc và tìm kiếm.
        </p>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
            <p className="mb-2 text-xs font-bold text-purple-700 uppercase tracking-wide">Bộ lọc</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• Lọc theo trạng thái: Sẵn bán / Đang giữ / Đã bán</li>
              <li>• Tìm kiếm theo tiêu đề</li>
            </ul>
          </div>
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
            <p className="mb-2 text-xs font-bold text-purple-700 uppercase tracking-wide">Sắp xếp</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• Mới nhất / Cũ nhất</li>
              <li>• Giá bán / Giá nhập tăng-giảm</li>
              <li>• GP cao nhất / Lực chiến cao nhất</li>
            </ul>
          </div>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Thao tác trên mỗi acc</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <ActionChip icon={Pencil} label="Chỉnh sửa" color="indigo" />
          <ActionChip icon={Copy} label="Copy link" color="slate" />
          <ActionChip icon={Tag} label="Thiết lập sale" color="amber" />
          <ActionChip icon={BadgeDollarSign} label="Đánh dấu đã bán" color="emerald" />
          <ActionChip icon={Trash2} label="Xóa" color="rose" />
        </div>

        <InfoBox type="tip">
          Dùng <strong>Copy link</strong> để lấy link trực tiếp đến trang chi tiết acc — tiện chia sẻ cho khách hỏi qua Zalo/Facebook.
        </InfoBox>
      </div>

      {/* Step 4 — Mark as sold */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          step={4}
          icon={BadgeDollarSign}
          title="Đánh Dấu Đã Bán"
          subtitle="Khi khách đã thanh toán và nhận acc"
          color="emerald"
        />
        <ol className="mb-4 space-y-3">
          {[
            'Vào danh sách Tài Khoản, tìm acc vừa bán.',
            'Nhấn vào nút thao tác (⋮) → chọn "Đánh dấu đã bán".',
            'Nhập giá bán thực tế (có thể khác giá niêm yết nếu thỏa thuận khác).',
            'Xác nhận — acc tự động chuyển sang trạng thái Sold và email liên kết sẽ được gỡ ra.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                {i + 1}
              </span>
              <p className="text-sm text-slate-600 pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
        <InfoBox type="info">
          Sau khi đánh dấu đã bán, acc vẫn hiển thị trên web trong mục <strong>"Tài Khoản Đã Bán"</strong> — giúp tăng độ tin cậy của shop với khách hàng mới.
        </InfoBox>
      </div>

      {/* Step 5 — Sale */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          step={5}
          icon={Tag}
          title="Thiết Lập Giảm Giá (Sale)"
          subtitle="Hiển thị giá gạch + badge % giảm trên web"
          color="amber"
        />
        <p className="mb-4 text-sm text-slate-600 leading-relaxed">
          Tính năng này giúp acc nổi bật hơn với dòng chữ <strong className="text-rose-600">-30% GIẢM</strong> và giá cũ bị gạch.
        </p>
        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
          <FieldRow label="Giá gốc (gạch)" desc='Giá "niêm yết" cao hơn — sẽ bị gạch ngang. Phải lớn hơn giá sale.' required />
          <FieldRow label="Giá sale thực tế" desc="Giá khách thực sự trả — phải nhỏ hơn giá gốc." required />
        </div>
        <InfoBox type="tip">
          Bạn có thể <strong>chỉnh lại giá sale</strong> bất cứ lúc nào, hoặc <strong>xóa sale</strong> để quay về giá thường.
        </InfoBox>
      </div>

      {/* Step 6 — Stats */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          step={6}
          icon={LayoutDashboard}
          title="Theo Dõi Doanh Thu"
          subtitle="Menu: Bảng Điều Khiển"
          color="rose"
        />
        <p className="mb-4 text-sm text-slate-600">
          Trang dashboard hiển thị thống kê tổng hợp chỉ của bạn:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Tổng acc", desc: "Tất cả acc bạn đang quản lý" },
            { label: "Sẵn bán", desc: "Acc đang hiển thị trên web" },
            { label: "Đã bán", desc: "Tổng số acc đã bán được" },
            { label: "Doanh thu", desc: "Tổng tiền thu về từ acc đã bán" },
            { label: "Chi phí", desc: "Tổng giá nhập của acc đã bán" },
            { label: "Lợi nhuận", desc: "Doanh thu trừ chi phí — hiện màu xanh nếu lãi" },
          ].map(({ label, desc }) => (
            <div key={label} className="rounded-xl border border-rose-100 bg-rose-50 p-3.5">
              <p className="text-sm font-bold text-rose-700">{label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={UserCircle}
          title="Hồ Sơ Cá Nhân"
          subtitle="Menu: Hồ Sơ Cá Nhân"
          color="slate"
        />
        <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
          <FieldRow label="Tên hiển thị" desc="Tên này hiển thị trên giao diện quản trị và trong email thông báo gửi về chủ shop." />
          <FieldRow label="Email" desc="Email đăng nhập — không thể thay đổi. Liên hệ chủ shop nếu cần đổi." />
        </div>
      </div>

      {/* Important notes */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <SectionHeader
          icon={AlertTriangle}
          title="Lưu Ý Quan Trọng"
          color="amber"
        />
        <div className="space-y-3">
          <InfoBox type="warning">
            <span>
              <strong>Hệ thống phê duyệt:</strong> Acc mới tạo hoặc chỉnh sửa có thể cần chủ shop duyệt trước khi hiển thị công khai. Nếu bạn thấy badge <strong>"Chờ duyệt"</strong> trên acc, hãy nhắn chủ shop để được duyệt nhanh.
            </span>
          </InfoBox>
          <InfoBox type="warning">
            <span>
              <strong>Thông báo tự động:</strong> Mỗi khi bạn tạo mới, chỉnh sửa, xóa hoặc đánh dấu đã bán một acc, <strong>chủ shop sẽ nhận được email thông báo</strong>. Đây là cơ chế giám sát bình thường.
            </span>
          </InfoBox>
          <InfoBox type="info">
            <span>
              <strong>Dữ liệu riêng biệt:</strong> Bạn chỉ thấy acc và email của chính mình. Các admin khác không thấy dữ liệu của bạn và ngược lại.
            </span>
          </InfoBox>
          <InfoBox type="tip">
            <span>
              <strong>Mật khẩu email game:</strong> Được lưu dạng plain text để bạn copy nhanh cho khách sau khi bán. Hãy chắc chắn nhập đúng và đầy đủ.
            </span>
          </InfoBox>
        </div>
      </div>

      {/* Quick reference */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={BookOpen}
          title="Quy Trình Chuẩn Từ A → Z"
          subtitle="Làm theo thứ tự này để không bị thiếu bước"
          color="indigo"
        />
        <ol className="space-y-4">
          {[
            { step: "Thêm email game vào hệ thống", sub: "Menu Email → Thêm Email Mới", icon: Mail, color: "bg-blue-100 text-blue-700" },
            { step: "Tạo tài khoản mới", sub: "Menu Tài Khoản → Thêm Tài Khoản — điền đầy đủ thông tin và upload ảnh", icon: Gamepad2, color: "bg-indigo-100 text-indigo-700" },
            { step: "Liên kết email với acc vừa tạo", sub: "Chọn email ở mục Liên kết Email trong form tạo/sửa acc", icon: Link2, color: "bg-purple-100 text-purple-700" },
            { step: "Chờ duyệt (nếu cần)", sub: "Nhắn chủ shop nếu acc chưa hiển thị sau vài phút", icon: Star, color: "bg-amber-100 text-amber-700" },
            { step: "Khi có khách mua → Đánh dấu đã bán", sub: "Nhấn ⋮ → Đánh dấu đã bán → Nhập giá thực tế", icon: BadgeDollarSign, color: "bg-emerald-100 text-emerald-700" },
            { step: "Kiểm tra lợi nhuận trên Dashboard", sub: "Menu Bảng Điều Khiển", icon: LayoutDashboard, color: "bg-rose-100 text-rose-700" },
          ].map(({ step, sub, icon: Icon, color }, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {i < 5 && <div className="w-px flex-1 bg-slate-200 h-4" />}
              </div>
              <div className="pb-1">
                <p className="text-sm font-semibold text-slate-900">{step}</p>
                <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="pb-8" />
    </div>
  );
}
