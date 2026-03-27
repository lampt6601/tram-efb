-- Add description field to accounts for detailed account info
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;

COMMENT ON COLUMN accounts.description IS 'Detailed description: players, packs, team info, etc.';

-- Update public views to include description
DROP VIEW IF EXISTS public_accounts;
CREATE VIEW public_accounts AS
SELECT
  id, title, description, selling_price, images, primary_image_url, status,
  total_gp, total_coins_android, total_coins_ios, team_strength,
  is_priority, is_clone, original_price, server_region, monthly_log_quota, created_at
FROM accounts
WHERE status = 'Available' AND is_approved = true;

GRANT SELECT ON public_accounts TO anon;

DROP VIEW IF EXISTS public_sold_accounts;
CREATE VIEW public_sold_accounts AS
SELECT
  id, title, description, selling_price, images, primary_image_url, status,
  total_gp, total_coins_android, total_coins_ios, team_strength,
  is_priority, is_clone, original_price, server_region, monthly_log_quota, created_at
FROM accounts
WHERE status = 'Sold';

GRANT SELECT ON public_sold_accounts TO anon;
