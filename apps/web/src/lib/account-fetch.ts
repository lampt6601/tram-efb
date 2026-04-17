import { cache } from "react";
import { createSupabaseAnonClient } from "@thc-efb/supabase/anon";
import type { PublicAccount } from "@thc-efb/supabase/types";

const ACCOUNT_FIELDS =
  "id, title, description, selling_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, server_region, monthly_log_quota, created_at, seller_full_name, seller_avatar_url, seller_transaction_box_url, seller_collateral_amount, seller_sold_count";

const META_FIELDS = "title, selling_price, primary_image_url, status";

/**
 * Fetch full account data for a given ID.
 * React.cache() deduplicates calls within the same render cycle (e.g., generateMetadata + page()).
 * Tries public_accounts first (available/deposited), falls back to public_sold_accounts.
 */
export const getAccountById = cache(
  async (
    id: string,
  ): Promise<{ account: PublicAccount | null; isSold: boolean }> => {
    const supabase = createSupabaseAnonClient();

    const { data: publicData } = await supabase
      .from("public_accounts")
      .select(ACCOUNT_FIELDS)
      .eq("id", id)
      .single();

    if (publicData) {
      return { account: publicData as PublicAccount, isSold: false };
    }

    const { data: soldData } = await supabase
      .from("public_sold_accounts")
      .select(ACCOUNT_FIELDS)
      .eq("id", id)
      .single();

    return {
      account: soldData ? (soldData as PublicAccount) : null,
      isSold: !!soldData,
    };
  },
);

/**
 * Lightweight version for generateMetadata — only fetches fields needed for OG tags.
 * Also deduped by React.cache() within the same render.
 */
export const getAccountMetaById = cache(
  async (
    id: string,
  ): Promise<{ title: string; selling_price: number; primary_image_url: string | null; status: string } | null> => {
    const supabase = createSupabaseAnonClient();

    const { data: pub } = await supabase
      .from("public_accounts")
      .select(META_FIELDS)
      .eq("id", id)
      .single();

    if (pub) return pub as typeof pub;

    const { data: sold } = await supabase
      .from("public_sold_accounts")
      .select(META_FIELDS)
      .eq("id", id)
      .single();

    return sold ?? null;
  },
);
