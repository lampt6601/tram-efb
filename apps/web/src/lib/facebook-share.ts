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

  // On mobile / PWA, window.open with features string is often blocked.
  // Use simple window.open without features, fallback to location.href.
  const newWindow = window.open(shareUrl, "_blank");
  if (!newWindow || newWindow.closed) {
    // Popup was blocked — navigate directly
    window.location.href = shareUrl;
  }
}
