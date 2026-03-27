import { MetadataRoute } from "next";
import { createSupabaseAnonClient } from "@/lib/supabase-anon";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thc-efb.com";
  const supabase = createSupabaseAnonClient();

  // Available accounts (high priority)
  const { data: publicAccounts } = await supabase
    .from("public_accounts")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const availableEntries =
    publicAccounts?.map((account) => ({
      url: `${baseUrl}/accounts/${account.id}`,
      lastModified: account.created_at
        ? new Date(account.created_at as string)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? [];

  // Sold accounts (lower priority, still indexed for social proof)
  const { data: soldAccounts } = await supabase
    .from("public_sold_accounts")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const soldEntries =
    soldAccounts?.map((account) => ({
      url: `${baseUrl}/accounts/${account.id}`,
      lastModified: account.created_at
        ? new Date(account.created_at as string)
        : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })) ?? [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/seller/apply`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...availableEntries,
    ...soldEntries,
  ];
}