-- Add seller collateral (ký quỹ) management system
-- Super-admin manages collateral amounts per admin

-- 1. Add collateral fields to admin_settings
ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS collateral_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS collateral_updated_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Create collateral history table for audit trail
CREATE TABLE IF NOT EXISTS public.seller_collateral_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('increase', 'decrease', 'refund', 'initial')),
  amount NUMERIC(12, 2) NOT NULL,
  new_total NUMERIC(12, 2) NOT NULL,
  notes TEXT DEFAULT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.seller_collateral_history ENABLE ROW LEVEL SECURITY;

-- Super admin full access to collateral history
CREATE POLICY "super_admin_full_access_collateral_history" ON public.seller_collateral_history
  FOR ALL TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7')
  WITH CHECK (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

-- Admins can read their own collateral history
CREATE POLICY "admin_read_own_collateral_history" ON public.seller_collateral_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
