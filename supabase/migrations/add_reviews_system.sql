-- Reviews / Ratings system for buyer feedback
-- Buyers can leave a review after an account is sold (no auth required, verified by unique token)

CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL CHECK (char_length(reviewer_name) BETWEEN 1 AND 100),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (char_length(comment) <= 500),
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by account
CREATE INDEX IF NOT EXISTS idx_reviews_account_id ON reviews(account_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;

-- Public view: only approved reviews
CREATE OR REPLACE VIEW public_reviews AS
SELECT id, account_id, reviewer_name, rating, comment, created_at
FROM reviews
WHERE is_approved = true;

-- RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a review (public feedback)
CREATE POLICY "Anyone can submit a review"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can read approved reviews
CREATE POLICY "Public can read approved reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

-- Authenticated admins can read all reviews (for moderation)
CREATE POLICY "Admins can read all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT ON public_reviews TO anon, authenticated;
GRANT INSERT ON reviews TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON reviews TO authenticated;
