import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thu Mua Tài Khoản eFootball",
  description:
    "Bán tài khoản eFootball của bạn cho THC eFootball Shop. Định giá hợp lý, thanh toán nhanh chóng, quy trình đơn giản.",
  alternates: {
    canonical: "https://thc-efb.com/sell",
  },
  openGraph: {
    title: "Thu Mua Tài Khoản eFootball | THC EFB",
    description:
      "Bán tài khoản eFootball của bạn cho THC eFootball Shop. Định giá hợp lý, thanh toán nhanh chóng.",
    url: "/sell",
    type: "website",
  },
};

export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
