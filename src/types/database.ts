export type AccountStatus = "Available" | "Pending" | "Sold";

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
  created_at: string;
  updated_at: string;
}

export interface PublicAccount {
  id: string;
  title: string;
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
}

export interface AccountWithEmail extends Account {
  emails?: Email | null;
}

export interface AdminSettings {
  user_id: string;
  auto_approve: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  totalAccounts: number;
  availableAccounts: number;
  soldAccounts: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}
