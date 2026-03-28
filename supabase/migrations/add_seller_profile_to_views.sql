-- ============================================
-- Add seller profile fields to admin_settings
-- and expose them in public views via JOIN
-- ============================================

-- 1. Add seller profile columns to admin_settings
ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS zalo_link TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS facebook_link TEXT DEFAULT NULL;

COMMENT ON COLUMN public.admin_settings.display_name IS 'Public display name for the seller';
COMMENT ON COLUMN public.admin_settings.avatar_url IS 'Avatar image URL for the seller';
COMMENT ON COLUMN public.admin_settings.zalo_link IS 'Zalo contact link for the seller';
COMMENT ON COLUMN public.admin_settings.facebook_link IS 'Facebook profile link for the seller';

-- 2. Recreate public_accounts view with seller info via JOIN
DROP VIEW IF EXISTS public.public_accounts;
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
  s.display_name AS seller_display_name,
  s.avatar_url AS seller_avatar_url,
  s.zalo_link AS seller_zalo_link,
  s.facebook_link AS seller_facebook_link,
  (SELECT COUNT(*) FROM public.accounts sold WHERE sold.user_id = a.user_id AND sold.status = 'Sold')::int AS seller_sold_count
FROM public.accounts a
LEFT JOIN public.admin_settings s ON a.user_id = s.user_id
WHERE a.status = 'Available'
  AND a.is_approved = true;

GRANT SELECT ON public.public_accounts TO anon;
GRANT SELECT ON public.public_accounts TO authenticated;

-- 3. Recreate public_sold_accounts view with seller info via JOIN
DROP VIEW IF EXISTS public.public_sold_accounts;
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
  s.display_name AS seller_display_name,
  s.avatar_url AS seller_avatar_url,
  s.zalo_link AS seller_zalo_link,
  s.facebook_link AS seller_facebook_link,
  (SELECT COUNT(*) FROM public.accounts sold WHERE sold.user_id = a.user_id AND sold.status = 'Sold')::int AS seller_sold_count
FROM public.accounts a
LEFT JOIN public.admin_settings s ON a.user_id = s.user_id
WHERE a.status = 'Sold'
  AND a.is_approved = true;

GRANT SELECT ON public.public_sold_accounts TO anon;
GRANT SELECT ON public.public_sold_accounts TO authenticated;

-- 4. Allow admins to read their own settings row (for profile page)
CREATE POLICY "admin_read_own_settings" ON public.admin_settings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
