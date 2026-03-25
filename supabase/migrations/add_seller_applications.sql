-- Seller (admin) application system
-- Public users can apply to become sellers; super-admin reviews & approves

CREATE TABLE IF NOT EXISTS seller_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email text NOT NULL,
  phone text CHECK (char_length(phone) <= 20),
  zalo_link text CHECK (char_length(zalo_link) <= 200),
  reason text CHECK (char_length(reason) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Index for quick status filtering
CREATE INDEX IF NOT EXISTS idx_seller_applications_status ON seller_applications(status);

-- RLS
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Public can submit applications"
  ON seller_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can read applications
CREATE POLICY "Admins can read applications"
  ON seller_applications FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update (approve/reject)
CREATE POLICY "Admins can update applications"
  ON seller_applications FOR UPDATE
  TO authenticated
  USING (true);

GRANT INSERT ON seller_applications TO anon, authenticated;
GRANT SELECT, UPDATE ON seller_applications TO authenticated;
