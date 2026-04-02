"use server";

import { createSupabaseServerClient } from "@thc-efb/supabase/server";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";
import { checkIsSuperAdmin } from "@thc-efb/shared/super-admin";
import { revalidatePath } from "next/cache";

// ─── Public Actions ────────────────────────────────────────

export async function submitEventEntry(
  zaloName: string,
  facebookName: string,
  number: number,
) {
  const name = zaloName.trim() || facebookName.trim();
  if (!name) return { error: "Vui lòng nhập tên Zalo hoặc Facebook." };
  if (number < 1 || number > 199 || !Number.isInteger(number)) {
    return { error: "Số phải nằm trong khoảng 1 – 199." };
  }

  const service = createSupabaseServiceClient();

  const { error } = await service
    .from("event_entries")
    .insert({
      zalo_name: name,
      facebook_name: name,
      number,
    });

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "Hệ thống đang cấu hình không cho trùng số. Cần bỏ unique constraint/index của cột `number` trong bảng `event_entries` để bật luật mới.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/event");
  revalidatePath("/dashboard/super/event");
  return { success: true };
}

export async function submitMultipleEventEntries(
  zaloName: string,
  facebookName: string,
  numbers: number[],
) {
  const name = zaloName.trim() || facebookName.trim();
  if (!name) return { error: "Vui lòng nhập tên Zalo hoặc Facebook." };
  if (!numbers.length || numbers.length > 10) {
    return { error: "Số lượt phải từ 1 đến 10." };
  }
  for (const num of numbers) {
    if (num < 1 || num > 199 || !Number.isInteger(num)) {
      return { error: `Số ${num} không hợp lệ. Phải từ 1 – 199.` };
    }
  }
  if (new Set(numbers).size !== numbers.length) {
    return { error: "Các số trong danh sách không được trùng nhau." };
  }

  const service = createSupabaseServiceClient();

  const rows = numbers.map((num) => ({
    zalo_name: name,
    facebook_name: name,
    number: num,
  }));

  const { error } = await service.from("event_entries").insert(rows);

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "Hệ thống đang cấu hình không cho trùng số. Cần bỏ unique constraint/index của cột `number` trong bảng `event_entries` để bật luật mới.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/event");
  revalidatePath("/dashboard/super/event");
  revalidatePath("/dashboard/super/event/spin");
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
  revalidatePath("/dashboard/super/event");
}

export async function confirmPrize(
  prizeType: "grand" | "consolation",
  winningNumber: number,
) {
  await verifySuperAdmin();
  const service = createSupabaseServiceClient();

  // Get the earliest entry for this number (if multiple people picked same number)
  const { data: entry } = await service
    .from("event_entries")
    .select("zalo_name, facebook_name")
    .eq("number", winningNumber)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

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
  revalidatePath("/dashboard/super/event");
  revalidatePath("/dashboard/super/event/spin");
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
  revalidatePath("/dashboard/super/event");
  revalidatePath("/dashboard/super/event/spin");
}
