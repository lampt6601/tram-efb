"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { revalidatePath } from "next/cache";

// ─── Public Actions ────────────────────────────────────────

export async function submitEventEntry(
  zaloName: string,
  facebookName: string,
  number: number,
) {
  if (!zaloName.trim() || !facebookName.trim()) {
    return { error: "Vui lòng nhập đầy đủ tên Zalo và tên Facebook." };
  }
  if (number < 1 || number > 199 || !Number.isInteger(number)) {
    return { error: "Số phải nằm trong khoảng 1 – 199." };
  }

  const service = createSupabaseServiceClient();

  // Check if number already taken
  const { data: existing } = await service
    .from("event_entries")
    .select("id")
    .eq("number", number)
    .maybeSingle();

  if (existing) {
    return { error: `Số ${number} đã được người khác chọn rồi!` };
  }

  const { error } = await service
    .from("event_entries")
    .insert({
      zalo_name: zaloName.trim(),
      facebook_name: facebookName.trim(),
      number,
    });

  if (error) {
    if (error.code === "23505") {
      return { error: `Số ${number} đã được người khác chọn rồi!` };
    }
    return { error: error.message };
  }

  revalidatePath("/event");
  revalidatePath("/admin/dashboard/super/event");
  return { success: true };
}

// ─── Super Admin Actions ───────────────────────────────────

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

export async function deleteEventEntry(id: string) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service.from("event_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/event");
  revalidatePath("/admin/dashboard/super/event");
}

export async function confirmPrize(
  prizeType: "grand" | "consolation",
  winningNumber: number,
) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  // Get the entry for this number
  const { data: entry } = await service
    .from("event_entries")
    .select("zalo_name, facebook_name")
    .eq("number", winningNumber)
    .single();

  if (!entry) {
    throw new Error("Số này chưa được ai chọn!");
  }

  // Upsert result (replace if re-confirming same prize type)
  const { error } = await service
    .from("event_results")
    .upsert(
      {
        prize_type: prizeType,
        winning_number: winningNumber,
        zalo_name: entry.zalo_name,
        facebook_name: entry.facebook_name,
        confirmed_at: new Date().toISOString(),
      },
      { onConflict: "prize_type" },
    );

  if (error) throw new Error(error.message);
  revalidatePath("/event");
  revalidatePath("/admin/dashboard/super/event");
  revalidatePath("/admin/dashboard/super/event/spin");
}

export async function clearPrize(prizeType: "grand" | "consolation") {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("event_results")
    .delete()
    .eq("prize_type", prizeType);
  if (error) throw new Error(error.message);
  revalidatePath("/event");
  revalidatePath("/admin/dashboard/super/event");
  revalidatePath("/admin/dashboard/super/event/spin");
}
