import type { Metadata } from "next";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EventPageClient from "./EventPageClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "🎰 Vòng Quay May Mắn - Mừng 2K User & 100 Anh Em Zalo",
  description:
    "Minigame quay số trúng thưởng cây nhà lá vườn. Chọn số, quay vòng quay và rinh acc game xịn từ THC eFootball Shop!",
  openGraph: {
    title: "🎰 Vòng Quay May Mắn - THC eFootball Shop",
    description:
      "EVENT: Mừng THC EFB cán mốc 2K User & 100 Anh Em Zalo. Quay số trúng acc game cực khét!",
    url: "/event",
    images: [
      {
        url: "/thc-shop.jpg",
        width: 1200,
        height: 630,
        alt: "THC eFootball Shop - Vòng Quay May Mắn",
      },
    ],
  },
};

export default async function EventPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: entries }, { data: results }] = await Promise.all([
    supabase
      .from("event_entries")
      .select("id, zalo_name, facebook_name, number, created_at")
      .order("number", { ascending: true }),
    supabase
      .from("event_results")
      .select("prize_type, winning_number, zalo_name, facebook_name"),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <Header />
      <main className="flex-1">
        <EventPageClient
          entries={entries ?? []}
          results={results ?? []}
        />
      </main>
      <Footer />
    </div>
  );
}
