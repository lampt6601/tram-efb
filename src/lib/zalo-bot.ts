const ZALO_BOT_API = "https://bot-api.zaloplatforms.com/bot";

/**
 * Send a Zalo Bot notification with an optional photo.
 * Uses sendPhoto if photoUrl is provided, falls back to sendMessage (text only).
 * Non-blocking: never throws — logs errors and returns false.
 *
 * @see https://bot.zapps.me/docs/apis/sendPhoto/
 * @see https://bot.zapps.me/docs/apis/sendMessage/
 */
export async function sendZaloBotNotification(
  text: string,
  photoUrl?: string | null,
): Promise<boolean> {
  const token = process.env.ZALO_BOT_TOKEN;
  const chatId = process.env.ZALO_BOT_CHAT_ID;

  if (!token || !chatId) {
    console.error("ZALO_BOT_TOKEN or ZALO_BOT_CHAT_ID is missing.");
    return false;
  }

  const baseUrl = `${ZALO_BOT_API}${token}`;

  try {
    // Try sendPhoto if we have an image URL
    if (photoUrl) {
      const res = await fetch(`${baseUrl}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: text,
        }),
      });

      const data = await res.json();
      if (data.ok) return true;

      console.error(
        "Zalo Bot sendPhoto failed, falling back to sendMessage:",
        data.description ?? JSON.stringify(data),
      );
    }

    // Fallback: text-only message
    const res = await fetch(`${baseUrl}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const data = await res.json();
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
