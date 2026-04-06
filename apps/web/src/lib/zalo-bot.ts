const ZALO_BOT_API = "https://bot-api.zaloplatforms.com/bot";

export type ZaloButton = { text: string; url: string };

/**
 * No-op — Zalo Bot uses plain text, no HTML escaping needed.
 * Exported for drop-in compatibility with former Telegram call sites.
 */
export function escapeHtml(str: string): string {
  return str;
}

/** Strip HTML tags and unescape HTML entities from Telegram-era formatted strings. */
function cleanText(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Send a Zalo Bot notification with optional photos and inline keyboard buttons.
 *
 * Routing:
 *   - No photos  → sendMessage (text + buttons)
 *   - 1+ photos  → sendPhoto with first photo (caption + buttons)
 *                  Falls back to sendMessage if sendPhoto fails.
 *
 * Accepts a single URL string or an array (first photo is used; Zalo Bot
 * does not support media groups).
 * Non-blocking: never throws — logs errors and returns false.
 *
 * Uses ZALO_BOT_TOKEN and ZALO_BOT_CHAT_ID env vars.
 * Caption limit: 1024 chars (sendPhoto), 4096 chars (sendMessage).
 */
export async function sendZaloNotification(
  text: string,
  photoUrl?: string | string[] | null,
  buttons?: ZaloButton[][] | null,
): Promise<boolean> {
  const token = process.env.ZALO_BOT_TOKEN;
  const chatId = process.env.ZALO_BOT_CHAT_ID;

  if (!token || !chatId) {
    console.error("ZALO_BOT_TOKEN or ZALO_BOT_CHAT_ID is missing.");
    return false;
  }

  const baseUrl = `${ZALO_BOT_API}${token}`;

  // Strip HTML from legacy Telegram-formatted strings
  const plainText = cleanText(text);

  // Normalize photos — use first only (Zalo Bot has no sendMediaGroup)
  const photos = (Array.isArray(photoUrl) ? photoUrl : photoUrl ? [photoUrl] : []).filter(Boolean);
  const firstPhoto = photos[0] ?? null;

  // Build inline keyboard — flat rows of URL buttons
  const replyMarkup =
    buttons?.length
      ? {
          inline_keyboard: buttons.map((row) =>
            row.map((b) => ({ text: b.text, url: b.url })),
          ),
        }
      : undefined;

  try {
    // ── Photo: sendPhoto with caption + buttons ───────────────────────────────
    if (firstPhoto) {
      const caption = plainText.length > 1024 ? plainText.slice(0, 1021) + "..." : plainText;
      const res = await fetch(`${baseUrl}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: firstPhoto,
          caption,
          ...(replyMarkup && { reply_markup: replyMarkup }),
        }),
      });

      const data = (await res.json()) as { ok: boolean; description?: string };
      if (data.ok) return true;

      console.error(
        "Zalo Bot sendPhoto failed, falling back to sendMessage:",
        data.description ?? JSON.stringify(data),
      );
    }

    // ── Fallback / no photo: sendMessage with text + buttons ─────────────────
    const truncated = plainText.length > 4096 ? plainText.slice(0, 4093) + "..." : plainText;
    const res = await fetch(`${baseUrl}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncated,
        ...(replyMarkup && { reply_markup: replyMarkup }),
      }),
    });

    const data = (await res.json()) as { ok: boolean; description?: string };
    if (!data.ok) {
      console.error(
        "Zalo Bot sendMessage failed:",
        data.description ?? JSON.stringify(data),
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Zalo Bot notification error:", error);
    return false;
  }
}
