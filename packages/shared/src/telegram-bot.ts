const TELEGRAM_API = "https://api.telegram.org/bot";

/** Escapes HTML special characters for Telegram HTML parse_mode. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface InlineButton {
  text: string;
  url: string;
}

function buildReplyMarkup(buttons: InlineButton[][] | null | undefined) {
  if (!buttons?.length) return undefined;
  return {
    inline_keyboard: buttons.map((row) =>
      row.map((b) => ({ text: b.text, url: b.url })),
    ),
  };
}

/**
 * Order gallery URLs: primary first, then others, deduped, max 10 (Telegram album limit).
 */
export function buildGalleryPhotoUrls(
  primary: string | null | undefined,
  images: string[] | null | undefined,
): string[] {
  const list = images ?? [];
  const ordered = primary
    ? [primary, ...list.filter((u) => u && u !== primary)]
    : [...list];
  return ordered.filter(Boolean).slice(0, 10);
}

async function sendTelegramTo(
  token: string | undefined,
  chatId: string | undefined,
  label: string,
  text: string,
  photoUrls?: string | string[] | null,
  buttons?: InlineButton[][] | null,
): Promise<boolean> {
  if (!token || !chatId) {
    console.error(`${label}: bot token or chat id is missing.`);
    return false;
  }

  const baseUrl = `${TELEGRAM_API}${token}`;
  const photos = (
    Array.isArray(photoUrls) ? photoUrls : photoUrls ? [photoUrls] : []
  )
    .filter(Boolean)
    .slice(0, 10);

  const replyMarkup = buildReplyMarkup(buttons ?? null);

  try {
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

      const data = (await res.json()) as { ok: boolean; description?: string };
      if (data.ok) return true;

      console.error(
        "Telegram sendPhoto failed, falling back to sendMessage:",
        data.description ?? JSON.stringify(data),
      );
    }

    if (photos.length >= 2) {
      const caption = text.length > 1024 ? text.slice(0, 1021) + "..." : text;
      const mediaGroup = photos.map((url, i) => ({
        type: "photo" as const,
        media: url,
        ...(i === 0 && { caption, parse_mode: "HTML" as const }),
      }));

      const res = await fetch(`${baseUrl}/sendMediaGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, media: mediaGroup }),
      });

      const data = (await res.json()) as { ok: boolean; description?: string };
      if (!data.ok) {
        console.error(
          "Telegram sendMediaGroup failed, falling back to sendMessage:",
          data.description ?? JSON.stringify(data),
        );
      } else {
        if (replyMarkup) {
          const anchor =
            text.split("\n")[0]?.trim() || "👇";
          await fetch(`${baseUrl}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: anchor,
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: replyMarkup,
            }),
          });
        }
        return true;
      }
    }

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

    const data = (await res.json()) as { ok: boolean; description?: string };
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

/**
 * Main admin channel: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
 * Albums: 2–10 photos via sendMediaGroup; inline URL buttons (no raw links in caption).
 */
export async function sendTelegramNotification(
  text: string,
  photoUrls?: string | string[] | null,
  buttons?: InlineButton[][] | null,
): Promise<boolean> {
  return sendTelegramTo(
    process.env.TELEGRAM_BOT_TOKEN,
    process.env.TELEGRAM_CHAT_ID,
    "TELEGRAM_BOT",
    text,
    photoUrls,
    buttons,
  );
}

/**
 * Reviewer group: TELEGRAM_REVIEWER_BOT_TOKEN + TELEGRAM_REVIEWER_CHAT_ID.
 */
export async function sendTelegramReviewerNotification(
  text: string,
  photoUrls?: string | string[] | null,
  buttons?: InlineButton[][] | null,
): Promise<boolean> {
  return sendTelegramTo(
    process.env.TELEGRAM_REVIEWER_BOT_TOKEN,
    process.env.TELEGRAM_REVIEWER_CHAT_ID,
    "TELEGRAM_REVIEWER",
    text,
    photoUrls,
    buttons,
  );
}
