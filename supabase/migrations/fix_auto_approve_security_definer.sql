-- Fix: trigger function cần SECURITY DEFINER để bypass RLS khi đọc admin_settings.
-- Không có SECURITY DEFINER, function chạy với quyền của user đang insert,
-- RLS chặn SELECT trên admin_settings → FOUND = false → is_approved không được set.

CREATE OR REPLACE FUNCTION public.auto_approve_super_admin_accounts()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_auto_approve BOOLEAN;
BEGIN
  -- Super admin: always auto-approve
  IF NEW.user_id = '1318d567-e19d-40e6-a165-0455330a51a7' THEN
    NEW.is_approved = true;
    RETURN NEW;
  END IF;

  -- Check if this admin has auto_approve permission
  -- SECURITY DEFINER allows reading admin_settings bypassing RLS
  SELECT auto_approve INTO v_auto_approve
  FROM public.admin_settings
  WHERE user_id = NEW.user_id;

  IF FOUND AND v_auto_approve = true THEN
    NEW.is_approved = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
