import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@thc-efb/ui/sonner";
import { TmaSDKProvider } from "@/components/tma/TmaSDKProvider";
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
  viewportFit: "cover",
};

export default function TmaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <head>
        <meta name="telegram-mini-app" content="true" />
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <TmaSDKProvider>
          {children}
        </TmaSDKProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
