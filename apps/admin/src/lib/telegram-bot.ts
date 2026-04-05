const TELEGRAM_API = "https://api.telegram.org/bot";

/** Escapes HTML special characters to prevent parse errors in HTML parse_mode. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type InlineButton =
  | { text: string; url: string }
  | { text: string; web_app: { url: string } };

/**
 * Send a Telegram Bot notification with optional photos and inline keyboard buttons.
 *
 * Routing:
 *   - No photos  → sendMessage (text + buttons)
 *   - 1 photo    → sendPhoto (caption + buttons in one message)
 *   - 2-10 photos → sendMediaGroup (caption on first) + follow-up sendMessage with buttons
 *
 * Accepts a single URL string or an array of URLs for photos.
 * HTML parse_mode for rich formatting. Non-blocking: never throws — logs errors and returns false.
 *
 * Caption limit: 1024 chars (sendPhoto / sendMediaGroup first item), 4096 chars (sendMessage).
 */
export async function sendTelegramNotification(
  text: string,
  photoUrls?: string | string[] | null,
  buttons?: InlineButton[][] | null,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.");
    return false;
  }

  const baseUrl = `${TELEGRAM_API}${token}`;

  // Normalize to array, filter empty values, cap at Telegram's 10-item limit
  const photos = (Array.isArray(photoUrls) ? photoUrls : photoUrls ? [photoUrls] : [])
    .filter(Boolean)
    .slice(0, 10);

  const replyMarkup =
    buttons?.length
      ? {
          inline_keyboard: buttons.map((row) =>
            row.map((b) =>
              "url" in b
                ? { text: b.text, url: b.url }
                : { text: b.text, web_app: b.web_app },
            ),
          ),
        }
      : undefined;

  try {
    // ── Single photo: sendPhoto with caption + buttons in one message ──────────
    if (photos.length === 1) {
      const caption = text.length > 1024 ? text.slice(0, 1021) + "..." : text;
      const res = await fetch(`${baseUrl}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photos[0],
          caption,
          parse_mode: "HTML",
          ...(replyMarkup && { reply_markup: replyMarkup }),
        }),
      });

      const data = await res.json();
      if (data.ok) return true;

      console.error(
        "Telegram sendPhoto failed, falling back to sendMessage:",
        data.description ?? JSON.stringify(data),
      );
    }

    // ── Multiple photos: sendMediaGroup + optional follow-up buttons message ───
    if (photos.length >= 2) {
      const caption = text.length > 1024 ? text.slice(0, 1021) + "..." : text;

      const mediaGroup = photos.map((url, i) => ({
        type: "photo" as const,
        media: url,
        // Caption + parse_mode only on the first item
        ...(i === 0 && { caption, parse_mode: "HTML" }),
      }));

      const res = await fetch(`${baseUrl}/sendMediaGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, media: mediaGroup }),
      });

      const data = await res.json();
      if (!data.ok) {
        console.error(
          "Telegram sendMediaGroup failed, falling back to sendMessage:",
          data.description ?? JSON.stringify(data),
        );
      } else {
        // Media group sent — send follow-up message with buttons if present.
        // sendMediaGroup does not support reply_markup, so buttons need a separate message.
        if (replyMarkup) {
          // Extract first line (bold title) as the follow-up anchor text
          const firstLine = text.split("\n")[0] ?? "⚡️";
          await fetch(`${baseUrl}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: firstLine,
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: replyMarkup,
            }),
          });
        }
        return true;
      }
    }

    // ── Fallback / no photos: sendMessage with text + buttons ─────────────────
    const res = await fetch(`${baseUrl}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(replyMarkup && { reply_markup: replyMarkup }),
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error(
        "Telegram sendMessage failed:",
        data.description ?? JSON.stringify(data),
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram notification error:", error);
    return false;
  }
}

export { escapeHtml };
