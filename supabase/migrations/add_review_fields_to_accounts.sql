-- Add reviewer tracking fields to accounts table
-- Lưu ai đã duyệt/từ chối, khi nào, và lý do từ chối

ALTER TABLE public.accounts
  ADD COLUMN rejection_reason TEXT DEFAULT NULL,
  ADD COLUMN reviewed_by UUID DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN reviewed_at TIMESTAMPTZ DEFAULT NULL;
