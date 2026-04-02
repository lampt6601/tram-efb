-- Push notification subscriptions (Web Push API)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  device_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Admin notification log (for in-app bell + badge count)
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = broadcast to all admins
  type TEXT NOT NULL,              -- 'sell_request', 'review', 'application', 'account_approved', 'account_created'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',        -- Extra payload (account_id, request_id, url, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON admin_notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_broadcast_unread
  ON admin_notifications(is_read, created_at DESC)
  WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_push_subs_user
  ON push_subscriptions(user_id);

-- RLS: push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS: admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can read their own notifications + broadcasts
CREATE POLICY "Users read own or broadcast notifications"
  ON admin_notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can mark their own notifications as read
CREATE POLICY "Users update own or broadcast notifications"
  ON admin_notifications FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Service role can insert notifications (from server actions)
-- No INSERT policy needed — server actions use service client which bypasses RLS
