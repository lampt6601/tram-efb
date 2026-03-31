-- Add zalo_name field to admin_settings
-- Used to display the seller's Zalo display name on public pages (e.g. bảo kê page)

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS zalo_name TEXT DEFAULT NULL;

COMMENT ON COLUMN public.admin_settings.zalo_name IS 'Zalo display name for the admin/seller';
