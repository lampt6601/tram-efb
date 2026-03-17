import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { checkIsSuperAdmin } from "@/lib/super-admin";
import { Dices, ExternalLink } from "lucide-react";
import { SpinWheelAdmin } from "./SpinWheelAdmin";
import Link from "next/link";

export const revalidate = 0;

export default async function SuperEventSpinPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !checkIsSuperAdmin(user.email)) {
    redirect("/admin/dashboard");
  }

  const service = createSupabaseServiceClient();

  const [{ data: entries }, { data: results }] = await Promise.all([
    service
      .from("event_entries")
      .select("id, zalo_name, facebook_name, number, created_at")
      .order("created_at", { ascending: true }),
    service
      .from("event_results")
      .select("prize_type, winning_number, zalo_name, facebook_name"),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <Dices className="h-4 w-4 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Vòng Quay Sự Kiện</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Mừng THC EFB cán mốc <span className="font-semibold text-indigo-600">2K User & 100 Anh Em Zalo</span> —{" "}
            {entries?.length ?? 0} số đã được đăng ký
          </p>
        </div>
        <Link
          href="/event"
          target="_blank"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600"
        >
          <ExternalLink className="h-4 w-4" />
          Trang sự kiện
        </Link>
      </div>

      <SpinWheelAdmin entries={entries ?? []} results={results ?? []} />
    </div>
  );
}
