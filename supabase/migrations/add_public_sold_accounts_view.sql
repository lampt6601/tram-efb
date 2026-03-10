-- Public view for SOLD accounts (safe columns only)
-- This avoids RLS differences between anon/authenticated sessions on storefront pages.
CREATE OR REPLACE VIEW public.public_sold_accounts AS
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
  created_at
FROM public.accounts
WHERE status = 'Sold';

GRANT SELECT ON public.public_sold_accounts TO anon;
