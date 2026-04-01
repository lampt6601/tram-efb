import { unstable_cache } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import type { User } from "@supabase/supabase-js";

/**
 * Cached wrapper around supabase.auth.admin.listUsers().
 *
 * listUsers() is an expensive Auth API call (~500ms-2s) that was being called
 * 9+ times across different pages without caching. Each admin dashboard page,
 * the homepage StatsBar, and seller contact API all call it independently.
 *
 * This utility caches the result for 5 minutes (300s), shared across all callers.
 * Revalidate by calling: revalidateTag("admin-users")
 */
export const getAdminUsers = unstable_cache(
  async (): Promise<User[]> => {
    const service = createSupabaseServiceClient();
    const { data } = await service.auth.admin.listUsers({ perPage: 1000 });
    return data?.users ?? [];
  },
  ["admin-users-list"],
  { revalidate: 300, tags: ["admin-users"] },
);

/**
 * Get the count of admin/seller users (excluding super admin).
 * Uses the same cached user list.
 */
export const getSellerCount = unstable_cache(
  async (): Promise<number> => {
    const users = await getAdminUsers();
    // Subtract 1 for super admin
    return Math.max(users.length - 1, 0);
  },
  ["seller-count"],
  { revalidate: 300, tags: ["admin-users"] },
);
