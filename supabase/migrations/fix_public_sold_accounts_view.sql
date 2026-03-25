-- Fix: Add missing server_region column to public_sold_accounts view
-- The previous migration used CREATE OR REPLACE which cannot add new columns,
-- so we need to DROP and recreate.
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

GRANT SELECT ON public.public_sold_accounts TO anon;
GRANT SELECT ON public.public_sold_accounts TO authenticated;
