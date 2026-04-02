import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import type { SiteSetting } from "@/types/database";

/**
 * Fetch a single site setting by key.
 * Uses anon client — no auth required.
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  const supabase = createSupabaseAnonClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single<Pick<SiteSetting, "value">>();
  return data?.value ?? null;
}

/**
 * Fetch multiple site settings at once.
 * Returns a map of key → value.
 */
export async function getSiteSettings(keys: string[]): Promise<Record<string, string>> {
  const supabase = createSupabaseAnonClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }
  return map;
}

/**
 * Fetch all site settings (for admin page).
 */
export async function getAllSiteSettings(): Promise<SiteSetting[]> {
  const supabase = createSupabaseAnonClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .order("key");
  return (data ?? []) as SiteSetting[];
}
