-- Sell requests: customers wanting to sell their accounts to the shop
CREATE TABLE IF NOT EXISTS sell_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  images text[] NOT NULL DEFAULT '{}',
  description text CHECK (char_length(description) <= 1000),
  price_expectation text NOT NULL CHECK (char_length(price_expectation) <= 100),
  seller_name text NOT NULL CHECK (char_length(seller_name) BETWEEN 1 AND 100),
  zalo_phone text NOT NULL CHECK (char_length(zalo_phone) BETWEEN 5 AND 15),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'purchased', 'rejected')),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sell_requests_status ON sell_requests(status);

ALTER TABLE sell_requests ENABLE ROW LEVEL SECURITY;

-- No public access — all operations go through service client in server actions
GRANT SELECT, INSERT, UPDATE, DELETE ON sell_requests TO authenticated;
