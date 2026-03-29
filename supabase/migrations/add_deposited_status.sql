-- Add "Deposited" status for deposit/hold feature
ALTER TYPE account_status ADD VALUE 'Deposited' AFTER 'Pending';

-- Add deposit metadata columns
ALTER TABLE accounts ADD COLUMN deposit_amount NUMERIC(12, 2) DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN deposit_customer_name TEXT DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN deposit_customer_contact TEXT DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN deposit_hold_until DATE DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN deposit_notes TEXT DEFAULT NULL;
