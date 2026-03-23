import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { FloatingConsultation } from "@/components/ui/FloatingConsultation";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thc-efb.com"),
  title: {
    default: "THC eFootball Shop - Cửa Hàng Tài Khoản eFootball Uy Tín",
    template: "%s | THC eFootball Shop",
  },
  description:
    "Chào mừng bạn đến với THC eFootball Shop. Chuyên cung cấp tài khoản eFootball chất lượng, nạp game an toàn và giao dịch nhanh chóng. Uy tín đặt lên hàng đầu!",
  keywords: [
    "trần hữu cảnh efootball",
    "tran huu canh efootball",
    "trần hữu cảnh thc shop",
    "trần hữu cảnh fb",
    "account efootball",
    "mua bán acc efootball",
    "shop account efootball uy tín",
    "thc efootball shop",
    "thc efootball",
  ],
  authors: [{ name: "Trần Hữu Cảnh" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "THC eFootball Shop",
    title: "THC eFootball Shop - Cửa Hàng Tài Khoản eFootball",
    description:
      "Chào mừng bạn đến với THC eFootball Shop. Chuyên cung cấp tài khoản eFootball chất lượng, nạp game an toàn và giao dịch nhanh chóng. Uy tín đặt lên hàng đầu!",
    url: "https://thc-efb.com",
    images: [
      {
        url: "/thc-shop.png",
        width: 1200,
        height: 630,
        alt: "THC eFootball Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "THC eFootball Shop - Cửa Hàng Tài Khoản eFootball",
    description:
      "Chào mừng bạn đến với THC eFootball Shop. Chuyên cung cấp tài khoản eFootball chất lượng, nạp game an toàn và giao dịch nhanh chóng. Uy tín đặt lên hàng đầu!",
    images: ["/thc-shop.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <meta
        name="google-site-verification"
        content="trJhJ1lGcDKXthkx1ozmLiOXoxCM9nhp536tTfFd-dE"
      />
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
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
              url: "https://thc-efb.com",
              founder: {
                "@type": "Person",
                name: "Trần Hữu Cảnh",
                url: "https://www.facebook.com/share/1B7kgySoVd/?mibextid=wwXIfr",
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
              alternateName: ["THC Shop", "THC eFootball"],
              url: "https://thc-efb.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://thc-efb.com/?q={search_term_string}",
                "query-input": "required name=search_term_string",
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
        <Analytics />
        <FloatingConsultation />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
