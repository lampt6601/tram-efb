/** Shared sort options for account listing pages */
export const ACCOUNT_SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_asc", label: "Giá bán tăng" },
  { value: "price_desc", label: "Giá bán giảm" },
  { value: "gp_desc", label: "GP cao nhất" },
  { value: "strength_desc", label: "Lực chiến cao nhất" },
] as const;

/** Extended sort options for admin accounts page (includes purchase price sorts) */
export const ADMIN_ACCOUNT_SORT_OPTIONS = [
  ...ACCOUNT_SORT_OPTIONS,
  { value: "purchase_asc", label: "Giá nhập tăng" },
  { value: "purchase_desc", label: "Giá nhập giảm" },
] as const;

/** Shared status options for account listing pages */
export const ACCOUNT_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "Available", label: "Sẵn Sàng" },
  { value: "Pending", label: "Đang Chờ" },
  { value: "Deposited", label: "Đang Cọc" },
  { value: "Sold", label: "Đã Bán" },
] as const;
