import { createSupabaseAnonClient } from '@thc-efb/supabase/anon';
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import type { Metadata } from "next";
import { AccHoldersClient } from "./AccHoldersClient";

export const revalidate = 60; // 1 minute

export const metadata: Metadata = {
  title: "Danh sách người giữ tài khoản | Sạp Acc eFootball",
};

export default async function AccHoldersPage() {
  const supabase = createSupabaseAnonClient();

  const { data: accounts } = await supabase
    .from("public_accounts")
    .select("id, title, seller_full_name, seller_transaction_box_url")
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Danh sách tài khoản & Người giữ
          </h1>
        </div>

        <AccHoldersClient accounts={accounts || []} />
      </main>
      <Footer />
    </div>
  );
}
