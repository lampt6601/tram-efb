import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Câu Hỏi Thường Gặp | THC eFootball Shop",
  description:
    "Câu hỏi thường gặp về mua bán tài khoản eFootball. Hướng dẫn mua acc, thanh toán, bảo hành, và thông tin chung về acc clone, server Japan và các chỉ số game.",
  alternates: {
    canonical: "https://thc-efb.com/faq",
  },
  openGraph: {
    title: "Câu Hỏi Thường Gặp | THC eFootball Shop",
    description:
      "Tìm câu trả lời cho các câu hỏi phổ biến về mua bán tài khoản eFootball tại THC Shop.",
    url: "/faq",
    images: [
      {
        url: "/thc-shop.png",
        width: 1200,
        height: 630,
        alt: "FAQ - THC eFootball Shop",
      },
    ],
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
