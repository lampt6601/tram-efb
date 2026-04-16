import { MetadataRoute } from "next";
import { createSupabaseAnonClient } from '@thc-efb/supabase/anon';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thc-efb.com";
  const supabase = createSupabaseAnonClient();

  // Available accounts
  const { data: publicAccounts } = await supabase
    .from("public_accounts")
    .select("id, created_at, seller_full_name")
    .order("created_at", { ascending: false });

  const availableEntries = publicAccounts?.map((account) => ({
    url: `${baseUrl}/accounts/${account.id}`,
    lastModified: account.created_at ? new Date(account.created_at as string) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  })) ?? [];

  // Unique seller names for shop pages
  const sellerNames = [...new Set(
    (publicAccounts ?? [])
      .map((a) => a.seller_full_name)
      .filter(Boolean) as string[]
  )];

  const sellerEntries = sellerNames.map((name) => ({
    url: `${baseUrl}/shop/${encodeURIComponent(name)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/sell`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/seller/apply`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...sellerEntries,
    ...availableEntries,
    // NOTE: Sold accounts removed from sitemap — they have noindex in metadata
  ];
}