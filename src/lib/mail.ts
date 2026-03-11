import nodemailer from "nodemailer";

export async function sendAdminNotificationMail(
  subject: string,
  htmlContent: string,
) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error(
      "EMAIL_USER or EMAIL_APP_PASSWORD environment variables are missing.",
    );
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"THC EFB Admin" <${user}>`,
      to: "tranhuucanhpes@gmail.com",
      subject,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    return false;
  }
}
