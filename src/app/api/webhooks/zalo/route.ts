import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { sendZaloBotReply } from "@/lib/zalo-bot";
import { formatCurrency } from "@/lib/constants";

const BASE_URL = "https://thc-efb.com";

/** Keywords that trigger the "account availability" intent. */
const AVAILABILITY_KEYWORDS = [
  "còn bao nhiêu",
  "bao nhiêu acc",
  "còn acc",
  "acc sẵn sàng",
  "còn hàng",
  "có acc",
  "mấy acc",
  "còn không",
  "acc nào",
  "tài khoản nào",
  "sẵn sàng",
  "available",
];

function matchesIntent(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase().trim();
  return keywords.some((kw) => lower.includes(kw));
}

/** Build the fallback greeting + menu message. */
function buildMenuMessage(displayName?: string): string {
  const greeting = displayName ? `Xin chào ${displayName}! 👋` : "Xin chào! 👋";
  return [
    greeting,
    "Mình là bot của THC eFootball Shop.",
    "",
    "Bạn có thể hỏi mình:",
    '• "Còn bao nhiêu acc?" — Xem số lượng tài khoản đang bán',
    "",
    `🔗 Xem shop: ${BASE_URL}`,
  ].join("\n");
}

/**
 * POST /api/webhooks/zalo
 * Receives incoming messages from Zalo Bot webhook and auto-replies.
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = process.env.ZALO_WEBHOOK_SECRET;
  const headerSecret = request.headers.get("x-bot-api-secret-token");

  if (!secret || headerSecret !== secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const eventName = body?.result?.event_name;
    const message = body?.result?.message;

    // Only handle text messages
    if (eventName !== "message.text.received" || !message?.text || !message?.chat?.id) {
      return NextResponse.json({ message: "Ignored" });
    }

    const chatId: string = message.chat.id;
    const text: string = message.text;
    const displayName: string | undefined = message.from?.display_name;

    // --- Intent: Account availability ---
    if (matchesIntent(text, AVAILABILITY_KEYWORDS)) {
      const service = createSupabaseServiceClient();

      // Count available + approved accounts
      const { count, error } = await service
        .from("accounts")
        .select("id", { count: "exact", head: true })
        .eq("status", "Available")
        .eq("is_approved", true);

      if (error) {
        console.error("Webhook Supabase query error:", error);
        await sendZaloBotReply(chatId, "⚠️ Xin lỗi, mình không thể kiểm tra dữ liệu lúc này.");
        return NextResponse.json({ message: "DB error" });
      }

      const total = count ?? 0;

      // Get price range
      const { data: priceData } = await service
        .from("accounts")
        .select("selling_price")
        .eq("status", "Available")
        .eq("is_approved", true)
        .order("selling_price", { ascending: true })
        .limit(1);

      const { data: maxPriceData } = await service
        .from("accounts")
        .select("selling_price")
        .eq("status", "Available")
        .eq("is_approved", true)
        .order("selling_price", { ascending: false })
        .limit(1);

      const minPrice = priceData?.[0]?.selling_price;
      const maxPrice = maxPriceData?.[0]?.selling_price;

      const lines: string[] = [
        `⚽ THC eFootball Shop`,
        "",
        `📦 Hiện tại shop có ${total} tài khoản đang bán.`,
      ];

      if (total > 0 && minPrice != null && maxPrice != null) {
        lines.push(
          `💰 Giá từ ${formatCurrency(minPrice)} — ${formatCurrency(maxPrice)}`,
        );
      }

      lines.push("", `🔗 Xem ngay: ${BASE_URL}`);

      await sendZaloBotReply(chatId, lines.join("\n"));
      return NextResponse.json({ message: "Replied: availability" });
    }

    // --- Fallback: greeting + menu ---
    await sendZaloBotReply(chatId, buildMenuMessage(displayName));
    return NextResponse.json({ message: "Replied: menu" });
  } catch (error) {
    console.error("Zalo webhook error:", error);
    // Always return 200 to avoid Zalo retries
    return NextResponse.json({ message: "Error handled" });
  }
}
