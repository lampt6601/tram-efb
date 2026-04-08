"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { revalidatePath } from "next/cache";

async function verifySuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !checkIsSuperAdmin(user.email)) {
    throw new Error("Unauthorized: Super admin only");
  }
  return user;
}

/**
 * Get all approval board members with their user metadata.
 */
export async function getApprovalBoardMembers() {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const { data: members, error } = await service
    .from("approval_board_members")
    .select("id, user_id, added_by, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  if (!members || members.length === 0) return [];

  // Resolve user names/emails
  const { data: usersData } = await service.auth.admin.listUsers({ perPage: 200 });
  const userMap: Record<string, { name: string; email: string }> = {};
  if (usersData?.users) {
    for (const u of usersData.users) {
      userMap[u.id] = {
        name: (u.user_metadata?.full_name as string) || "",
        email: u.email || "",
      };
    }
  }

  return members.map((m) => ({
    ...m,
    name: userMap[m.user_id]?.name ?? "",
    email: userMap[m.user_id]?.email ?? "",
  }));
}

/**
 * Add an admin to the approval board.
 */
export async function addBoardMember(userId: string) {
  const superAdmin = await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const { error } = await service.from("approval_board_members").insert({
    user_id: userId,
    added_by: superAdmin.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/super/approval-board");
}

/**
 * Remove an admin from the approval board.
 */
export async function removeBoardMember(userId: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const { error } = await service
    .from("approval_board_members")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/super/approval-board");
}

/**
 * Get all admins (admin_settings users) not yet in the board — for the "Add" selector.
 */
export async function getEligibleAdminsForBoard() {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  const [{ data: members }, { data: usersData }] = await Promise.all([
    service.from("approval_board_members").select("user_id"),
    service.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const boardUserIds = new Set((members ?? []).map((m) => m.user_id));

  const { data: adminSettings } = await service
    .from("admin_settings")
    .select("user_id, is_disabled");

  const activeAdminIds = new Set(
    (adminSettings ?? [])
      .filter((s) => !s.is_disabled)
      .map((s) => s.user_id)
  );

  return (usersData?.users ?? [])
    .filter((u) => activeAdminIds.has(u.id) && !boardUserIds.has(u.id) && !checkIsSuperAdmin(u.email))
    .map((u) => ({
      id: u.id,
      name: (u.user_metadata?.full_name as string) || "",
      email: u.email || "",
    }));
}
