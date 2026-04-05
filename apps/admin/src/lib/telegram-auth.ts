import { createHmac } from "crypto";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

/**
 * Validates Telegram Mini App initData using HMAC-SHA-256.
 * See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Returns the parsed Telegram user on success, null on failure.
 */
export function validateTelegramInitData(
  initDataRaw: string,
): TelegramUser | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return null;
  }

  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get("hash");
    if (!hash) return null;

    // Validate auth_date freshness (5 min window)
    const authDate = params.get("auth_date");
    if (!authDate) return null;
    const age = Math.floor(Date.now() / 1000) - parseInt(authDate, 10);
    if (age > 300) {
      console.warn("Telegram initData is expired:", age, "seconds old");
      return null;
    }

    // Build data-check string: sorted params (excluding hash), joined by \n
    const entries: string[] = [];
    params.forEach((value, key) => {
      if (key !== "hash") entries.push(`${key}=${value}`);
    });
    entries.sort();
    const dataCheckString = entries.join("\n");

    // Compute HMAC: secret = HMAC-SHA-256("WebAppData", botToken)
    const secretKey = createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();
    const computedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (computedHash !== hash) {
      console.warn("Telegram initData hash mismatch");
      return null;
    }

    // Parse the user JSON from initData
    const userRaw = params.get("user");
    if (!userRaw) return null;
    const user = JSON.parse(userRaw) as TelegramUser;
    if (!user.id) return null;

    return user;
  } catch (err) {
    console.error("validateTelegramInitData error:", err);
    return null;
  }
}
