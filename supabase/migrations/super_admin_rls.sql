-- Super Admin RLS Policies
-- Grants the owner full access to ALL accounts and emails.
-- Replace the UID below with the actual UID of tranhuucanh2000@gmail.com
-- (find it in Supabase Dashboard > Authentication > Users)
-- Run this in Supabase SQL Editor.

-- ─── accounts ────────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_select_accounts" ON public.accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

CREATE POLICY "super_admin_insert_accounts" ON public.accounts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

CREATE POLICY "super_admin_update_accounts" ON public.accounts
  FOR UPDATE TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7')
  WITH CHECK (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

CREATE POLICY "super_admin_delete_accounts" ON public.accounts
  FOR DELETE TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

-- ─── emails ──────────────────────────────────────────────────────────────────

CREATE POLICY "super_admin_select_emails" ON public.emails
  FOR SELECT TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

CREATE POLICY "super_admin_insert_emails" ON public.emails
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

CREATE POLICY "super_admin_update_emails" ON public.emails
  FOR UPDATE TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7')
  WITH CHECK (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

CREATE POLICY "super_admin_delete_emails" ON public.emails
  FOR DELETE TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');
