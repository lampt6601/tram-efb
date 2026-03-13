-- ============================================
-- Admin settings: auto-approve permission
-- ============================================

-- 1. Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_approve BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Super admin has full access
CREATE POLICY "super_admin_full_access_admin_settings" ON public.admin_settings
  FOR ALL TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7')
  WITH CHECK (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

-- 2. Update the trigger to also auto-approve accounts from trusted admins
CREATE OR REPLACE FUNCTION public.auto_approve_super_admin_accounts()
RETURNS TRIGGER
SET search_path = ''
AS $$
DECLARE
  v_auto_approve BOOLEAN;
BEGIN
  -- Super admin: always auto-approve
  IF NEW.user_id = '1318d567-e19d-40e6-a165-0455330a51a7' THEN
    NEW.is_approved = true;
    RETURN NEW;
  END IF;

  -- Check if this admin has auto_approve permission
  SELECT auto_approve INTO v_auto_approve
  FROM public.admin_settings
  WHERE user_id = NEW.user_id;

  IF FOUND AND v_auto_approve = true THEN
    NEW.is_approved = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
