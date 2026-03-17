"use client";

import Image from "next/image";
import { Trophy, Users, UserPlus, MessageCircle, ShieldCheck, AlertTriangle } from "lucide-react";

const prizes = [
  {
    icon: Trophy,
    label: "Giải May Mắn",
    badge: "🥇",
    description: "1 Acc game trị giá 1xx k VND",
    detail: "Acc duy nhất của chương trình (ảnh minh họa bên dưới).",
    gradient: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    textColor: "text-amber-300",
  },
];

const turnRules = [
  {
    icon: MessageCircle,
    label: "+1 Lượt",
    description: "Đang là thành viên trong Box Zalo của THC EFB.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: UserPlus,
    label: "+1 Lượt",
    description: "Đã kết bạn Facebook với Admin (Chủ shop).",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Users,
    label: "+1 Lượt/Bonus",
    description:
      "Cứ mời thành công 3 người bạn mới tham gia vào Box Zalo, anh em sẽ được cộng thêm 1 lượt chọn số.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

export function EventInfo() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Prize Structure */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
          <span className="text-2xl">🎁</span> Cơ Cấu Giải Thưởng
        </h2>
        <div className="grid gap-4">
          {prizes.map((prize) => (
            <div
              key={prize.label}
              className={`group relative overflow-hidden rounded-2xl border ${prize.border} bg-gradient-to-br ${prize.gradient} p-5 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <prize.icon className={`h-5 w-5 ${prize.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{prize.badge}</span>
                    <span className={`text-sm font-bold ${prize.textColor}`}>
                      {prize.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {prize.description}
                  </p>
                  <p className="mt-0.5 text-xs text-white/60">{prize.detail}</p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image
                  src="/event-prize.png"
                  alt="Giải thưởng sự kiện"
                  width={1200}
                  height={675}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to earn turns */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
          <span className="text-2xl">🎮</span> Cách Nhận Lượt Chọn Số
          <span className="text-sm font-normal text-white/50">(Chọn từ 1 đến 199)</span>
        </h2>
        <div className="space-y-3">
          {turnRules.map((rule, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border ${rule.border} ${rule.bg} p-4 backdrop-blur-sm transition-all hover:scale-[1.01]`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10`}>
                <rule.icon className={`h-4 w-4 ${rule.color}`} />
              </div>
              <div>
                <span className={`text-xs font-bold ${rule.color} rounded-full border ${rule.border} px-2 py-0.5`}>
                  {rule.label}
                </span>
                <p className="mt-1.5 text-sm text-white/80">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
          <p className="text-sm text-indigo-200">
            <span className="font-bold text-indigo-300">👉 Ví dụ:</span> Bạn đang ở trong box Zalo (1 lượt) + Đã kết bạn FB Admin (1 lượt) + Mời thêm 3 bạn vào box (1 lượt) ={" "}
            <span className="font-bold text-white">Tổng cộng bạn được điền 3 con số khác nhau lên web.</span>
          </p>
        </div>
      </div>

      {/* Transparency Rules */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
          <span className="text-2xl">⚖️</span> Góc Minh Bạch & Tự Giác
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div className="space-y-2 text-sm text-white/80">
              <p>Anh em tự tính toán số lượt mình được nhận và điền số lượng con số tương ứng lên Website.</p>
              <p>
                <span className="font-semibold text-emerald-300">Quy trình xác minh:</span> Khi vòng quay gọi tên người trúng giải, Admin sẽ yêu cầu cung cấp bằng chứng (Ảnh chụp màn hình đã kết bạn FB, lịch sử mời bạn bè vào group Zalo...).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div className="text-sm text-white/80">
              <span className="font-semibold text-red-300">🚫 Xử lý vi phạm:</span> Nếu anh em quay trúng nhưng không chứng minh được số lượt mình đã nhận là hợp lệ (gian lận, khai khống lượt), kết quả sẽ bị{" "}
              <span className="font-bold text-red-300">HỦY BỎ NGAY LẬP TỨC</span> và phần thưởng sẽ nhường cho người xứng đáng hơn.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
