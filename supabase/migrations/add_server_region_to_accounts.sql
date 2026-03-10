-- Add server_region to accounts to track eFootball region/server (e.g. Nhật, Maroc, Hong Kong)
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS server_region TEXT;

-- Update public view for available accounts to expose server_region
-- Need to DROP then CREATE because CREATE OR REPLACE không cho thêm cột mới.
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
  created_at
FROM public.accounts
WHERE status = 'Available';

-- Update public view for sold accounts to expose server_region
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
  created_at
FROM public.accounts
WHERE status = 'Sold';

