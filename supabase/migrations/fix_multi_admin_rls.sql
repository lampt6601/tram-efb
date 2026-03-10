-- ==============================================================================
-- MIGRATION: Fix Multi-Admin RLS Policies Overlap
-- Description: Ensures admins only see their own accounts and emails 
--              and public query only applies to anon role.
-- ==============================================================================

-- 1. Drop old overlapping policies on emails
DROP POLICY IF EXISTS "Admin full access to own emails" ON emails;
DROP POLICY IF EXISTS "Admin full access to emails" ON emails;

-- 2. Drop old overlapping policies on accounts
DROP POLICY IF EXISTS "Public can view available accounts" ON accounts;
DROP POLICY IF EXISTS "Admin full access to own accounts" ON accounts;
DROP POLICY IF EXISTS "Admin full access to accounts" ON accounts;
DROP POLICY IF EXISTS "Public can view active and sold accounts" ON accounts;
DROP POLICY IF EXISTS "Public can view accounts" ON accounts;

-- 3. Create strictly isolated policies for emails
-- Only authenticated users (admins) can access, and ONLY their own emails
CREATE POLICY "Admin full access to own emails"
  ON emails FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Create strictly isolated policies for accounts
-- Admins can do everything on their OWN accounts
CREATE POLICY "Admin full access to own accounts"
  ON accounts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public (unauthenticated anon users) can just read all accounts
CREATE POLICY "Public can view available accounts"
  ON accounts FOR SELECT
  TO anon
  USING (true);
