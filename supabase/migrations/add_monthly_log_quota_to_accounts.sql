-- Per-account monthly log quota (different for each account)
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS monthly_log_quota INTEGER DEFAULT 10;

-- Refresh public view for available accounts to expose monthly_log_quota
DROP VIEW IF EXISTS public.public_accounts;
CREATE VIEW public.public_accounts AS
SELECT
  id,
  title,
  selling_price,
  images,
  primary_image_url,
  status,
  total_gp,
  total_coins_android,
  total_coins_ios,
  team_strength,
  is_priority,
  original_price,
  server_region,
  monthly_log_quota,
  created_at
FROM public.accounts
WHERE status = 'Available';

-- Refresh public view for sold accounts to expose monthly_log_quota
DROP VIEW IF EXISTS public.public_sold_accounts;
CREATE VIEW public.public_sold_accounts AS
SELECT
  id,
  title,
  selling_price,
  images,
  primary_image_url,
  status,
  total_gp,
  total_coins_android,
  total_coins_ios,
  team_strength,
  is_priority,
  original_price,
  server_region,
  monthly_log_quota,
  created_at
FROM public.accounts
WHERE status = 'Sold';

