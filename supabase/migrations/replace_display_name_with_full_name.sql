-- Replace display_name with full_name from auth.users
-- Creates a SECURITY DEFINER helper to access auth.users from public views

-- 1. Create helper function to get full_name from auth.users
CREATE OR REPLACE FUNCTION public.get_user_full_name(uid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    raw_user_meta_data->>'full_name',
    split_part(email, '@', 1)
  )
  FROM auth.users
  WHERE id = uid;
$$;

-- 2. Drop dependent views
DROP VIEW IF EXISTS public.public_accounts;
DROP VIEW IF EXISTS public.public_sold_accounts;

-- 3. Recreate public_accounts view using get_user_full_name
CREATE VIEW public.public_accounts AS
SELECT
  a.id,
  a.title,
  a.description,
  a.selling_price,
  a.images,
  a.primary_image_url,
  a.status,
  a.total_gp,
  a.total_coins_android,
  a.total_coins_ios,
  a.team_strength,
  a.is_priority,
  a.is_clone,
  a.original_price,
  a.server_region,
  a.monthly_log_quota,
  a.created_at,
  public.get_user_full_name(a.user_id) AS seller_full_name,
  s.avatar_url AS seller_avatar_url,
  s.transaction_box_url AS seller_transaction_box_url,
  s.collateral_amount AS seller_collateral_amount,
  (SELECT COUNT(*) FROM public.accounts sold WHERE sold.user_id = a.user_id AND sold.status = 'Sold')::int AS seller_sold_count
FROM public.accounts a
LEFT JOIN public.admin_settings s ON a.user_id = s.user_id
WHERE a.status IN ('Available', 'Deposited')
  AND a.is_approved = true;

GRANT SELECT ON public.public_accounts TO anon;
GRANT SELECT ON public.public_accounts TO authenticated;

-- 4. Recreate public_sold_accounts view using get_user_full_name
CREATE VIEW public.public_sold_accounts AS
SELECT
  a.id,
  a.title,
  a.description,
  a.selling_price,
  a.images,
  a.primary_image_url,
  a.status,
  a.total_gp,
  a.total_coins_android,
  a.total_coins_ios,
  a.team_strength,
  a.is_priority,
  a.is_clone,
  a.original_price,
  a.server_region,
  a.monthly_log_quota,
  a.created_at,
  public.get_user_full_name(a.user_id) AS seller_full_name,
  s.avatar_url AS seller_avatar_url,
  s.transaction_box_url AS seller_transaction_box_url,
  s.collateral_amount AS seller_collateral_amount,
  (SELECT COUNT(*) FROM public.accounts sold WHERE sold.user_id = a.user_id AND sold.status = 'Sold')::int AS seller_sold_count
FROM public.accounts a
LEFT JOIN public.admin_settings s ON a.user_id = s.user_id
WHERE a.status = 'Sold'
  AND a.is_approved = true;

GRANT SELECT ON public.public_sold_accounts TO anon;
GRANT SELECT ON public.public_sold_accounts TO authenticated;

-- 5. Drop display_name column from admin_settings
ALTER TABLE public.admin_settings DROP COLUMN IF EXISTS display_name;
