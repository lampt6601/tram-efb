import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thc-efb.com";
  const supabase = await createSupabaseServerClient();

  const { data: publicAccounts } = await supabase
    .from("public_accounts")
    .select("id, updated_at")
    .order("updated_at", { ascending: false });

  const accountEntries =
    publicAccounts?.map((account) => ({
      url: `${baseUrl}/accounts/${account.id}`,
      lastModified: account.updated_at
        ? new Date(account.updated_at as string)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...accountEntries,
  ];
}