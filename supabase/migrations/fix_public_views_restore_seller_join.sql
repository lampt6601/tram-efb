-- Fix: restore seller profile JOIN that was dropped by add_description_to_accounts migration

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
