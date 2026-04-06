import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@thc-efb/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { IosPwaProvider } from "@/components/common/IosPwaProvider";
import { cn } from "@thc-efb/shared/utils";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "THC Admin",
    template: "%s | THC Admin",
  },
  description: "Quản trị THC eFootball Shop",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <head>
        {/* iOS PWA: app icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* iOS PWA: standalone mode */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="THC Admin" />

        {/* iOS PWA: prevent phone number detection */}
        <meta name="format-detection" content="telephone=no" />

        {/* iOS: hand-off & smart banner disabled */}
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <IosPwaProvider />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            className: "mt-safe",
          }}
        />
        <OfflineIndicator />
        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`}
        </Script>
      </body>
    </html>
  );
}
