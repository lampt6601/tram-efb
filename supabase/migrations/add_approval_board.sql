-- Create approval board members table
-- Ban duyệt: super admin có thể thêm các admin vào ban để họ có quyền duyệt/từ chối acc

CREATE TABLE public.approval_board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.approval_board_members ENABLE ROW LEVEL SECURITY;

-- Super admin (hardcoded UID matching existing pattern) has full CRUD access
CREATE POLICY "super_admin_board_full" ON public.approval_board_members
  FOR ALL TO authenticated
  USING (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7')
  WITH CHECK (auth.uid() = '1318d567-e19d-40e6-a165-0455330a51a7');

-- Board members can read their own row (to verify membership)
CREATE POLICY "board_member_read_own" ON public.approval_board_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
