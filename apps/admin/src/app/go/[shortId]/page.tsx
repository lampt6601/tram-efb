import { redirect } from "next/navigation";

/**
 * /go/[shortId] — decode base64url UUID and redirect to /dashboard/noti
 * shortId = base64url(uuid_bytes) → 22 chars instead of 36-char UUID string
 */
export default async function GoPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;

  const uuid = shortIdToUuid(shortId);
  if (!uuid) redirect("/dashboard");

  redirect(`/dashboard/noti?id=${uuid}`);
}

function shortIdToUuid(shortId: string): string | null {
  try {
    const hex = Buffer.from(shortId, "base64url").toString("hex");
    if (hex.length !== 32) return null;
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  } catch {
    return null;
  }
}
