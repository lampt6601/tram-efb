import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { FloatingConsultation } from '@thc-efb/ui/floating-consultation';
import { Toaster } from '@thc-efb/ui/sonner';

import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { cn } from '@thc-efb/shared/utils';
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sap-efb.vercel.app"),
  icons: {
    icon: "/icon-shop.png",
    shortcut: "/icon-shop.png",
    apple: "/icon-shop.png",
  },
  alternates: {
    canonical: "https://sap-efb.vercel.app",
  },
  title: {
    default:
      "Sạp Acc eFootball | Shop Tài Khoản eFootball Uy Tín",
    template: "%s | Sạp Acc eFootball",
  },
  description:
    "Sạp Acc eFootball - shop tài khoản eFootball uy tín, cập nhật tài khoản chất lượng mỗi ngày, hỗ trợ nhanh qua Box cộng đồng.",
  keywords: [
    "shop acc efootball",
    "efootball elite",
    "mua acc efootball",
    "acc efootball mobile",
    "acc clone efootball",
    "shop acc efootball uy tín",
    "mua bán acc efootball mobile",
    "acc efootball giá rẻ",
    "tài khoản efootball",
    "shop efootball mobile",
    "acc efootball 2025",
    "acc efootball 2026",
    "mua acc pes mobile",
    "shop acc pes",
    "efootball shop",
  ],
  authors: [{ name: "Sạp Acc eFootball" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Sạp Acc eFootball",
    title: "Sạp Acc eFootball | Shop Tài Khoản eFootball Uy Tín",
    description:
      "Shop tài khoản eFootball uy tín, cập nhật tài khoản chất lượng mỗi ngày tại Sạp Acc eFootball.",
    url: "https://sap-efb.vercel.app",
    images: [
      {
        url: "/icon-shop.png",
        width: 1200,
        height: 630,
        alt: "Sạp Acc eFootball - Shop Tai Khoan eFootball",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sạp Acc eFootball | Shop Tai Khoan eFootball",
    description:
      "Shop tài khoản eFootball uy tín, hỗ trợ nhanh qua Box cộng đồng.",
    images: ["/icon-shop.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="trJhJ1lGcDKXthkx1ozmLiOXoxCM9nhp536tTfFd-dE"
        />
        <link rel="apple-touch-icon" href="/icon-shop.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sạp Acc eFootball" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Sạp Acc eFootball",
              alternateName: "Sạp Acc eFootball Shop",
              url: "https://sap-efb.vercel.app",
              logo: "https://sap-efb.vercel.app/icon-shop.png",
              description:
                "Shop tài khoản eFootball uy tín, hỗ trợ nhanh qua Box cộng đồng.",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: "Vietnamese",
                url: "https://zalo.me/g/pmpbi2qosaovor0ez3ys",
              },
              sameAs: ["https://zalo.me/g/pmpbi2qosaovor0ez3ys"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Sạp Acc eFootball",
              alternateName: [
                "Sạp Acc eFootball Shop",
                "Shop Acc eFootball",
                "Sạp Acc eFootball",
              ],
              url: "https://sap-efb.vercel.app",
              inLanguage: "vi",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://sap-efb.vercel.app/?q={search_term_string}",
                "query-input":
                  "required name=search_term_string",
              },
            }),
          }}
        />
        <FloatingConsultation />
        <Toaster position="top-right" richColors />
        <Script id="sw-unregister" strategy="afterInteractive">
          {`(function(){if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})})}if('caches'in window){caches.keys().then(function(n){return Promise.all(n.map(function(k){return caches.delete(k)}))})}})()`}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
