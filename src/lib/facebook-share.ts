/**
 * Opens a Facebook Share dialog pre-filled with account info.
 * Works with personal profiles — no API key required.
 * The user will see a share dialog and click "Post" to publish.
 */
export function openFacebookShare(
  accountId: string,
  accountTitle: string,
  sellingPrice?: number,
): void {
  const accountUrl = `https://thc-efb.com/accounts/${accountId}`;

  const priceStr = sellingPrice
    ? `\n💰 Giá: ${new Intl.NumberFormat("vi-VN").format(sellingPrice)}đ`
    : "";

  const caption =
    `🎮 Acc eFootball mới lên shop!\n` +
    `${accountTitle}` +
    `${priceStr}\n` +
    `👉 Xem và đặt mua: thc-efb.com`;

  const shareUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(accountUrl) +
    "&quote=" +
    encodeURIComponent(caption);

  window.open(shareUrl, "_blank", "width=620,height=520,noopener,noreferrer");
}
