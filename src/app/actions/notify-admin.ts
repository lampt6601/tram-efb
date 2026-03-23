"use server";

/**
 * Placeholder for admin action notifications.
 * Previously sent via email/Zalo Bot — currently disabled.
 * Kept to avoid breaking callers.
 */
export async function notifyAdminAction(
  _actionType: string,
  _accountTitle: string,
  _priceDetails?: {
    purchasePrice?: number;
    sellingPrice?: number;
    originalPrice?: number | null;
  },
  _accountId?: string,
  _primaryImageUrl?: string | null,
  _needsApproval?: boolean,
) {
  // No-op: notification system removed
}
