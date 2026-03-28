-- Add is_disabled column to admin_settings
ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.admin_settings.is_disabled IS 'When true, the admin cannot log in to the dashboard';
