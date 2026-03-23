import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

/**
 * GET /api/approve/:id?token=SECRET
 * Quick-approve an account via link (e.g. from Zalo Bot notification).
 * Secured by APPROVE_SECRET_TOKEN env var.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const secret = process.env.APPROVE_SECRET_TOKEN;
  const token = request.nextUrl.searchParams.get("token");

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const service = createSupabaseServiceClient();

    // Check account exists and is not already approved
    const { data: account, error: fetchErr } = await service
      .from("accounts")
      .select("id, title, is_approved")
      .eq("id", id)
      .single();

    if (fetchErr || !account) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản" },
        { status: 404 },
      );
    }

    if (account.is_approved) {
      return NextResponse.json({
        message: `"${account.title}" đã được duyệt trước đó.`,
      });
    }

    const { error } = await service
      .from("accounts")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/admin/dashboard/super/pending");
    revalidatePath("/admin/dashboard/super/accounts");
    revalidatePath("/");

    return NextResponse.json({
      message: `✅ Đã duyệt tài khoản "${account.title}" thành công!`,
    });
  } catch (err) {
    console.error("Approve API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
