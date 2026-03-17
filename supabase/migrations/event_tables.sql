-- ============================================
-- Event System Tables
-- ============================================

-- Event entries: stores each user's number pick
CREATE TABLE event_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zalo_name TEXT NOT NULL,
  facebook_name TEXT NOT NULL,
  number INTEGER NOT NULL CHECK (number >= 1 AND number <= 199),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(number)
);

-- Event results: stores the 2 prize winners (confirmed by admin)
CREATE TABLE event_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prize_type TEXT NOT NULL CHECK (prize_type IN ('grand', 'consolation')),
  winning_number INTEGER NOT NULL,
  zalo_name TEXT NOT NULL,
  facebook_name TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prize_type)
);

-- Enable RLS
ALTER TABLE event_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_results ENABLE ROW LEVEL SECURITY;

-- Public can read event_entries
CREATE POLICY "Public can view event entries"
  ON event_entries FOR SELECT
  TO anon
  USING (true);

-- Public can insert event_entries (for submitting numbers)
CREATE POLICY "Public can submit event entries"
  ON event_entries FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin full access to event_entries
CREATE POLICY "Admin full access to event entries"
  ON event_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can read event_results
CREATE POLICY "Public can view event results"
  ON event_results FOR SELECT
  TO anon
  USING (true);

-- Admin full access to event_results
CREATE POLICY "Admin full access to event results"
  ON event_results FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT ON event_entries TO anon;
GRANT SELECT ON event_results TO anon;
GRANT ALL ON event_entries TO authenticated;
GRANT ALL ON event_results TO authenticated;
