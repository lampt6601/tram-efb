-- ============================================
-- Site Settings Table (key-value global config)
-- ============================================
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read site settings
CREATE POLICY "Public can read site_settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated (super admin enforced at app level) can modify
CREATE POLICY "Authenticated can modify site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON site_settings TO anon;
GRANT ALL ON site_settings TO authenticated;

-- Seed default values
INSERT INTO site_settings (key, value, label) VALUES
  ('zalo_box_members', '200+', 'Số thành viên Box Zalo Shop'),
  ('zalo_group_members', '', 'Số thành viên Group Tư Vấn'),
  ('require_partner_ref', 'false', 'Chặn truy cập nếu không có Ref hợp lệ');
