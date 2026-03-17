-- ============================================
-- Add can_view_all_accounts permission to admin_settings
-- ============================================

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS can_view_all_accounts BOOLEAN NOT NULL DEFAULT false;
