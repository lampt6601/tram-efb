import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@thc-efb.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

/**
 * Send approval confirmation email to the seller.
 * Non-blocking: errors are caught and logged silently.
 */
export async function sendApprovalEmail(params: {
  to: string;
  accountTitle: string;
  accountUrl: string;
  reviewerName: string;
}): Promise<void> {
  try {
    await getResend().emails.send({
      from: `THC Shop <${FROM_EMAIL}>`,
      to: params.to,
      subject: `✅ Tài khoản "${params.accountTitle}" đã được duyệt`,
      html: `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:#16a34a;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">✅ Tài khoản đã được duyệt</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:#374151;font-size:15px;">Xin chào,</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;">
              Tài khoản <strong style="color:#111827;">"${escapeHtmlEmail(params.accountTitle)}"</strong> của bạn đã được
              <strong style="color:#16a34a;">duyệt bởi ${escapeHtmlEmail(params.reviewerName)}</strong> và hiện đang hiển thị trên shop.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${params.accountUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">
                Xem tài khoản
              </a>
            </div>
            <p style="margin:0;color:#6b7280;font-size:13px;">
              Nếu bạn không nhận ra email này, vui lòng bỏ qua.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">THC eFootball Shop</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  } catch (err) {
    console.error("[email] sendApprovalEmail failed:", err);
  }
}

/**
 * Send rejection notification email to the seller with the reason.
 * Non-blocking: errors are caught and logged silently.
 */
export async function sendRejectionEmail(params: {
  to: string;
  accountTitle: string;
  rejectionReason: string;
  reviewerName: string;
}): Promise<void> {
  try {
    await getResend().emails.send({
      from: `THC Shop <${FROM_EMAIL}>`,
      to: params.to,
      subject: `❌ Tài khoản "${params.accountTitle}" bị từ chối`,
      html: `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:#dc2626;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">❌ Tài khoản bị từ chối</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:#374151;font-size:15px;">Xin chào,</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;">
              Tài khoản <strong style="color:#111827;">"${escapeHtmlEmail(params.accountTitle)}"</strong> của bạn đã bị
              <strong style="color:#dc2626;">từ chối bởi ${escapeHtmlEmail(params.reviewerName)}</strong>.
            </p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:600;">Lý do từ chối:</p>
              <p style="margin:0;color:#374151;font-size:14px;white-space:pre-wrap;">${escapeHtmlEmail(params.rejectionReason)}</p>
            </div>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;">
              Bạn có thể chỉnh sửa tài khoản theo góp ý trên và gửi lại để duyệt từ trang quản lý.
            </p>
            <p style="margin:0;color:#6b7280;font-size:13px;">
              Nếu bạn không nhận ra email này, vui lòng bỏ qua.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">THC eFootball Shop</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  } catch (err) {
    console.error("[email] sendRejectionEmail failed:", err);
  }
}

function escapeHtmlEmail(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
