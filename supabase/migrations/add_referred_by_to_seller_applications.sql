-- Add referral tracking to seller applications
ALTER TABLE seller_applications
ADD COLUMN IF NOT EXISTS referred_by TEXT DEFAULT NULL;

COMMENT ON COLUMN seller_applications.referred_by IS 'CTV user_id or identifier who referred this applicant';
