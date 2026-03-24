import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

const BASE_URL = "https://thc-efb.com";

function htmlResponse(html: string, status = 200) {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function buildPage(title: string, emoji: string, message: string, redirectUrl?: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - THC eFootball Shop</title>
  ${redirectUrl ? `<meta http-equiv="refresh" content="10;url=${redirectUrl}">` : ""}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px 32px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .emoji { font-size: 56px; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .message { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
    .countdown { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }
    .countdown span { font-weight: 600; color: #4f46e5; }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: #4f46e5;
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn:hover { background: #4338ca; }
    .btn-outline {
      background: transparent;
      color: #4f46e5;
      border: 1.5px solid #e0e7ff;
      margin-left: 8px;
    }
    .btn-outline:hover { background: #f0f4ff; }
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      margin-top: 24px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #4f46e5;
      border-radius: 2px;
      animation: shrink 10s linear forwards;
    }
    @keyframes shrink { from { width: 100%; } to { width: 0%; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">${emoji}</div>
    <div class="title">${title}</div>
    <div class="message">${message}</div>
    ${redirectUrl ? `
    <div class="countdown">Tự động chuyển hướng sau <span id="timer">10</span> giây</div>
    <div>
      <a href="${redirectUrl}" class="btn">Xem tài khoản</a>
      <a href="${BASE_URL}" class="btn btn-outline">Về trang chủ</a>
    </div>
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <script>
      let s = 10;
      const el = document.getElementById('timer');
      const t = setInterval(() => { s--; el.textContent = s; if (s <= 0) clearInterval(t); }, 1000);
    </script>
    ` : `
    <div>
      <a href="${BASE_URL}" class="btn">Về trang chủ</a>
    </div>
    `}
  </div>
</body>
</html>`;
}

/**
 * GET /api/approve/:id?token=SECRET
 * Quick-approve an account via link (e.g. from Zalo Bot notification).
 * Returns a styled HTML page with auto-redirect to account detail.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const secret = process.env.APPROVE_SECRET_TOKEN;
  const token = request.nextUrl.searchParams.get("token");

  if (!secret || token !== secret) {
    return htmlResponse(
      buildPage("Không có quyền", "🔒", "Link duyệt không hợp lệ hoặc đã hết hạn."),
      401,
    );
  }

  try {
    const service = createSupabaseServiceClient();

    const { data: account, error: fetchErr } = await service
      .from("accounts")
      .select("id, title, is_approved")
      .eq("id", id)
      .single();

    if (fetchErr || !account) {
      return htmlResponse(
        buildPage("Không tìm thấy", "❓", "Tài khoản không tồn tại hoặc đã bị xóa."),
        404,
      );
    }

    const accountUrl = `${BASE_URL}/accounts/${id}`;

    if (account.is_approved) {
      return htmlResponse(
        buildPage(
          "Đã duyệt trước đó",
          "ℹ️",
          `Tài khoản <strong>"${account.title}"</strong> đã được duyệt rồi.`,
          accountUrl,
        ),
      );
    }

    const { error } = await service
      .from("accounts")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      return htmlResponse(
        buildPage("Lỗi hệ thống", "⚠️", `Không thể duyệt: ${error.message}`),
        500,
      );
    }

    revalidatePath("/admin/dashboard/super/pending");
    revalidatePath("/admin/dashboard/super/accounts");
    revalidatePath("/");

    return htmlResponse(
      buildPage(
        "Duyệt thành công!",
        "✅",
        `Tài khoản <strong>"${account.title}"</strong> đã được duyệt và hiển thị công khai.`,
        accountUrl,
      ),
    );
  } catch (err) {
    console.error("Approve API error:", err);
    return htmlResponse(
      buildPage("Lỗi hệ thống", "⚠️", "Đã xảy ra lỗi. Vui lòng thử lại sau."),
      500,
    );
  }
}
