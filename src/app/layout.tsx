import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { FloatingConsultation } from "@/components/ui/FloatingConsultation";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { cn } from "@/lib/utils";

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
  metadataBase: new URL("https://thc-efb.com"),
  alternates: {
    canonical: "https://thc-efb.com",
  },
  title: {
    default:
      "Shop Acc eFootball Mobile Uy Tín | Mua Bán Tài Khoản eFootball - THC EFB",
    template: "%s | THC eFootball Shop",
  },
  description:
    "Shop acc eFootball mobile uy tín #1. Mua bán tài khoản eFootball giá rẻ, acc clone chất lượng, giao dịch an toàn, bảo hành đổi trả. Cập nhật acc mới mỗi ngày tại THC eFootball Shop.",
  keywords: [
    "shop acc efootball",
    "mua acc efootball",
    "bán acc efootball",
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
    "thc efootball shop",
    "trần hữu cảnh efootball",
  ],
  authors: [{ name: "Trần Hữu Cảnh" }],
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
    siteName: "THC eFootball Shop",
    title: "Shop Acc eFootball Mobile Uy Tín | Mua Bán Tài Khoản - THC EFB",
    description:
      "Shop acc eFootball mobile uy tín. Mua bán tài khoản eFootball giá rẻ, acc clone chất lượng, giao dịch an toàn, bảo hành đổi trả. Cập nhật mỗi ngày.",
    url: "https://thc-efb.com",
    images: [
      {
        url: "/thc-shop.png",
        width: 1200,
        height: 630,
        alt: "THC eFootball Shop - Shop Acc eFootball Mobile Uy Tín",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Acc eFootball Mobile Uy Tín | THC eFootball Shop",
    description:
      "Mua bán acc eFootball mobile giá rẻ, uy tín. Acc clone chất lượng, giao dịch an toàn, bảo hành đổi trả.",
    images: ["/thc-shop.png"],
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="THC EFB" />
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
              "@type": "Person",
              name: "Trần Hữu Cảnh",
              url: "https://thc-efb.com",
              jobTitle: "Founder",
              worksFor: {
                "@type": "Organization",
                name: "THC eFootball Shop",
              },
              sameAs: [
                "https://zalo.me/0969347283",
                "https://www.facebook.com/share/1B7kgySoVd/?mibextid=wwXIfr",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "THC eFootball Shop",
              alternateName: "Shop Acc eFootball THC EFB",
              url: "https://thc-efb.com",
              logo: "https://thc-efb.com/thc-shop.png",
              description:
                "Shop mua bán tài khoản eFootball mobile uy tín. Acc clone chất lượng, giao dịch an toàn, bảo hành đổi trả.",
              founder: {
                "@type": "Person",
                name: "Trần Hữu Cảnh",
                url: "https://www.facebook.com/share/1B7kgySoVd/?mibextid=wwXIfr",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: "Vietnamese",
                url: "https://zalo.me/0969347283",
              },
              sameAs: [
                "https://zalo.me/0969347283",
                "https://www.facebook.com/share/1B7kgySoVd/?mibextid=wwXIfr",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "THC eFootball Shop",
              alternateName: [
                "THC Shop",
                "THC eFootball",
                "Shop Acc eFootball",
                "THC EFB Shop",
              ],
              url: "https://thc-efb.com",
              inLanguage: "vi",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://thc-efb.com/?q={search_term_string}",
                "query-input":
                  "required name=search_term_string",
              },
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","w2tnfh0fud");`}
        </Script>
        <Analytics />
        <FloatingConsultation />
        <Toaster position="top-right" richColors />
        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`}
        </Script>
      </body>
    </html>
  );
}
