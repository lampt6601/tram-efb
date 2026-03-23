import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client for public pages.
 * Does NOT use cookies or auth sessions — avoids "Refresh Token Not Found" errors.
 * Use this for querying public views (public_accounts, public_sold_accounts).
 */
export function createSupabaseAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
