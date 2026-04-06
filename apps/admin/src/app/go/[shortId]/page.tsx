import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@thc-efb/supabase/service";

/**
 * /go/[shortId] — short redirect to /dashboard/noti?id=<full-uuid>
 * shortId = first 8 hex chars of account UUID (e.g. "3be83c1b")
 */
export default async function GoPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;

  if (!shortId || !/^[0-9a-f]{8}$/i.test(shortId)) {
    redirect("/dashboard");
  }

  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("accounts")
    .select("id")
    .ilike("id", `${shortId}%`)
    .limit(1)
    .single();

  if (!data) redirect("/dashboard");

  redirect(`/dashboard/noti?id=${data.id}`);
}
