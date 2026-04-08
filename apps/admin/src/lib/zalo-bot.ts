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
 * Core implementation — send to an explicit chatId.
 * Non-blocking: never throws — logs errors and returns false.
 */
async function sendZaloNotificationTo(
  chatId: string,
  text: string,
  photoUrl?: string | string[] | null,
  buttons?: ZaloButton[][] | null,
): Promise<boolean> {
  const token = process.env.ZALO_BOT_TOKEN;

  if (!token || !chatId) {
    console.error("ZALO_BOT_TOKEN or chatId is missing.");
    return false;
  }

  const baseUrl = `${ZALO_BOT_API}${token}`;
  const plainText = cleanText(text);
  const photos = (Array.isArray(photoUrl) ? photoUrl : photoUrl ? [photoUrl] : []).filter(Boolean);
  const firstPhoto = photos[0] ?? null;
  const flatButtons = buttons?.flat() ?? [];
  const buttonLines = flatButtons.map((b) => `${b.text}: ${b.url}`).join("\n");
  const fullText = buttonLines ? `${plainText}\n\n${buttonLines}` : plainText;

  try {
    if (firstPhoto) {
      const caption = fullText.length > 1024 ? fullText.slice(0, 1021) + "..." : fullText;
      const res = await fetch(`${baseUrl}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, photo: firstPhoto, caption }),
      });
      const data = (await res.json()) as { ok: boolean; description?: string };
      if (data.ok) return true;
      console.error("Zalo Bot sendPhoto failed, falling back:", data.description ?? JSON.stringify(data));
    }

    const truncated = fullText.length > 4096 ? fullText.slice(0, 4093) + "..." : fullText;
    const res = await fetch(`${baseUrl}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: truncated }),
    });
    const data = (await res.json()) as { ok: boolean; description?: string };
    if (!data.ok) {
      console.error("Zalo Bot sendMessage failed:", data.description ?? JSON.stringify(data));
      return false;
    }
    return true;
  } catch (error) {
    console.error("Zalo Bot notification error:", error);
    return false;
  }
}

/**
 * Send a Zalo Bot notification with optional photo and action links.
 *
 * Zalo Bot does not support reply_markup / inline keyboard — buttons are
 * appended as plain-text URLs at the bottom of the message instead.
 *
 * Routing:
 *   - Photo provided → sendPhoto (caption = text + button links)
 *                      Falls back to sendMessage if sendPhoto fails.
 *   - No photo       → sendMessage (text + button links)
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
  const chatId = process.env.ZALO_BOT_CHAT_ID;
  if (!chatId) {
    console.error("ZALO_BOT_CHAT_ID is missing.");
    return false;
  }
  return sendZaloNotificationTo(chatId, text, photoUrl, buttons);
}

/**
 * Send a Zalo Bot notification to the reviewer group chat.
 * Uses ZALO_REVIEWER_CHAT_ID env var.
 * Non-blocking: never throws — logs errors and returns false.
 */
export async function sendZaloReviewerNotification(
  text: string,
  photoUrl?: string | string[] | null,
  buttons?: ZaloButton[][] | null,
): Promise<boolean> {
  const chatId = process.env.ZALO_REVIEWER_CHAT_ID;
  if (!chatId) {
    console.error("ZALO_REVIEWER_CHAT_ID is missing.");
    return false;
  }
  return sendZaloNotificationTo(chatId, text, photoUrl, buttons);
}
