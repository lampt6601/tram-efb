import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { FloatingConsultation } from "@/components/ui/FloatingConsultation";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thc-efb.vercel.app"),
  title: {
    default: "THC EFOOTBALL Shop - Cửa Hàng Tài Khoản eFootball Uy Tín",
    template: "%s | THC EFOOTBALL Shop",
  },
  description:
    "Chào mừng bạn đến với THC EFOOTBALL Shop. Chuyên cung cấp tài khoản eFootball chất lượng, nạp game an toàn và giao dịch nhanh chóng. Uy tín đặt lên hàng đầu!",
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
    siteName: "THC EFOOTBALL Shop",
    title: "THC EFOOTBALL Shop - Cửa Hàng Tài Khoản eFootball",
    description:
      "Chào mừng bạn đến với THC EFOOTBALL Shop. Chuyên cung cấp tài khoản eFootball chất lượng, nạp game an toàn và giao dịch nhanh chóng. Uy tín đặt lên hàng đầu!",
    url: "https://thc-efb.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "THC EFOOTBALL Shop - Cửa Hàng Tài Khoản eFootball",
    description:
      "Chào mừng bạn đến với THC EFOOTBALL Shop. Chuyên cung cấp tài khoản eFootball chất lượng, nạp game an toàn và giao dịch nhanh chóng. Uy tín đặt lên hàng đầu!",
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
              url: "https://thc-efb.vercel.app",
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
              url: "https://thc-efb.vercel.app",
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
              name: "THC EFOOTBALL Shop",
              alternateName: ["THC Shop", "THC eFootball"],
              url: "https://thc-efb.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://thc-efb.vercel.app/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Analytics />
        <FloatingConsultation />
      </body>
    </html>
  );
}
