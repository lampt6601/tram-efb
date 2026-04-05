-- Add telegram_user_id to admin_settings for TMA authentication
ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT DEFAULT NULL;

-- Ensure each Telegram account maps to exactly one admin
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_settings_telegram_user_id
  ON public.admin_settings (telegram_user_id)
  WHERE telegram_user_id IS NOT NULL;
