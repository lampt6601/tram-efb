import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Câu Hỏi Thường Gặp | Sạp Acc eFootball",
  description:
    "Câu hỏi thường gặp về mua bán tài khoản eFootball. Hướng dẫn mua acc, thanh toán, bảo hành, và thông tin chung về acc clone, server Japan và các chỉ số game.",
  alternates: {
    canonical: "https://sap-efb.vercel.app/faq",
  },
  openGraph: {
    title: "Câu Hỏi Thường Gặp | Sạp Acc eFootball",
    description:
      "Tìm câu trả lời cho các câu hỏi phổ biến về mua bán tài khoản eFootball tại THC Shop.",
    url: "/faq",
    images: [
      {
        url: "/icon-shop.png",
        width: 1200,
        height: 630,
        alt: "FAQ - Sạp Acc eFootball",
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
