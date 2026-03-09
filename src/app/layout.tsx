import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thc-efb.vercel.app"),
  title: {
    default: "THC EFOOTBALL Shop - Account eFootball uy tín, giá tốt",
    template: "%s | THC eFootball Shop",
  },
  description: "Mua bán tài khoản account eFootball uy tín, giá tốt tại THC EFOOTBALL Shop",
  keywords: [
    "account efootball",
    "mua bán acc efootball",
    "account efootball android",
    "account efootball ios",
    "shop account efootball uy tín",
    "thc efootball shop",
    "thc efootball",
    "thc efootball shop",
  ],
  authors: [{ name: "THC eFootball Shop" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "THC eFootball Shop",
    title: "THC EFOOTBALL Shop - Account eFootball uy tín, giá tốt",
    description:
      "Mua bán tài khoản account eFootball uy tín, giá tốt tại THC EFOOTBALL Shop",
  },
  twitter: {
    card: "summary_large_image",
    title: "THC EFOOTBALL Shop - Account eFootball uy tín, giá tốt",
    description:
      "Mua bán tài khoản account eFootball uy tín, giá tốt tại THC EFOOTBALL Shop",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta name="google-site-verification" content="trJhJ1lGcDKXthkx1ozmLiOXoxCM9nhp536tTfFd-dE" />
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
