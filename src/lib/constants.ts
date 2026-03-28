/** Max size per image upload (4MB), must be under serverActions.bodySizeLimit (5mb) */
export const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

export const CONTACT_ZALO_URL = "https://zalo.me/0969347283";
export const CONTACT_ZALO_GROUP_URL = "https://zalo.me/g/a3v3dgaj4ugylmmnwk0u";
export const CONTACT_MESSENGER_URL =
  "https://www.facebook.com/share/1B7kgySoVd/?mibextid=wwXIfr";

export const STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Sold: "bg-red-100 text-red-800",
};

/** Fallback labels for platform (use PlatformCoinIcons in UI for icons) */
export const PLATFORM_LABELS: Record<string, string> = {
  Android: "Android",
  iOS: "iOS",
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Compact currency: 220.000 → 220K, 1.500.000 → 1.5M */
export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M đ`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K đ`;
  }
  return `${amount} đ`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};
