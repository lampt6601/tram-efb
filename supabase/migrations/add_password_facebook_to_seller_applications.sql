-- Add password and facebook_link to seller_applications for auto-creation on approval
ALTER TABLE seller_applications
  ADD COLUMN IF NOT EXISTS password text CHECK (char_length(password) >= 8),
  ADD COLUMN IF NOT EXISTS facebook_link text CHECK (char_length(facebook_link) <= 200);

COMMENT ON COLUMN seller_applications.password IS 'Hashed or plain password for auto account creation on approval';
COMMENT ON COLUMN seller_applications.facebook_link IS 'Facebook profile link for seller profile setup';
