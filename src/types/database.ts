export type AccountStatus = "Available" | "Pending" | "Deposited" | "Sold";

export interface Email {
  id: string;
  email_address: string;
  password: string;
  recovery_info: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  title: string;
  description?: string | null;
  purchase_price: number;
  selling_price: number;
  original_price?: number | null;
  images: string[];
  primary_image_url: string | null;
  status: AccountStatus;
  total_gp: number;
  total_coins_android: number;
  total_coins_ios: number;
  team_strength: number;
  server_region?: string | null;
  monthly_log_quota?: number | null;
  email_id: string | null;
  user_id: string;
  is_priority?: boolean;
  is_clone?: boolean;
  is_approved: boolean;
  deposit_amount?: number | null;
  deposit_customer_name?: string | null;
  deposit_customer_contact?: string | null;
  deposit_hold_until?: string | null;
  deposit_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicAccount {
  id: string;
  title: string;
  description?: string | null;
  selling_price: number;
  original_price?: number | null;
  images: string[];
  primary_image_url: string | null;
  status: AccountStatus;
  total_gp: number;
  total_coins_android: number;
  total_coins_ios: number;
  team_strength: number;
  is_priority?: boolean;
  is_clone?: boolean;
  server_region?: string | null;
  monthly_log_quota?: number | null;
  created_at: string;
  // Seller profile (from view JOIN)
  seller_full_name?: string | null;
  seller_avatar_url?: string | null;

  seller_transaction_box_url?: string | null;
  seller_collateral_amount?: number | null;
  seller_sold_count?: number | null;
}

export interface AccountWithEmail extends Account {
  emails?: Email | null;
}

export interface AccountRequest {
  id: string;
  detail: string;
  price_level: string | null;
  requester_name: string;
  contact_platform: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export type SellRequestStatus = "pending" | "contacted" | "purchased" | "rejected";

export interface SellRequest {
  id: string;
  images: string[];
  description: string | null;
  price_expectation: string;
  seller_name: string;
  zalo_phone: string;
  status: SellRequestStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  account_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface PublicReview {
  id: string;
  account_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface SellerApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  zalo_link: string | null;
  facebook_link: string | null;
  password: string | null;
  reason: string | null;
  status: ApplicationStatus;
  admin_note: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  user_id: string;
  auto_approve: boolean;
  is_disabled: boolean;
  avatar_url?: string | null;
  zalo_name?: string | null;
  transaction_box_url?: string | null;
  collateral_amount: number;
  collateral_updated_at?: string | null;
  created_at: string;
}

export interface SellerCollateralHistory {
  id: string;
  user_id: string;
  change_type: "increase" | "decrease" | "refund" | "initial";
  amount: number;
  new_total: number;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  label: string | null;
  updated_at: string;
}

export interface DashboardMetrics {
  totalAccounts: number;
  availableAccounts: number;
  soldAccounts: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}
