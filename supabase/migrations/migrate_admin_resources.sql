-- ==============================================================================
-- MIGRATION: Multi-Admin Support
-- Description: Adds user_id to emails and accounts and migrates existing data
-- ==============================================================================

-- 1. Add user_id column allowing NULL temporarily for migration
ALTER TABLE emails ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Migrate existing data to the FIRST user in auth.users
-- This ensures the current single admin gets all existing accounts and emails
DO $$
DECLARE
    first_admin_id UUID;
BEGIN
    SELECT id INTO first_admin_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF first_admin_id IS NOT NULL THEN
        UPDATE emails SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE accounts SET user_id = first_admin_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 3. Make user_id NOT NULL and set DEFAULT for future rows
ALTER TABLE emails ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE emails ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE accounts ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 4. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);

-- 5. Update RLS Policies for Multi-Tenant Isolation
-- Drop old policies
DROP POLICY IF EXISTS "Admin full access to emails" ON emails;
DROP POLICY IF EXISTS "Admin full access to accounts" ON accounts;

-- Create new isolated policies
CREATE POLICY "Admin full access to own emails"
  ON emails FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access to own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: The policy "Public can view available accounts" remains unchanged.
