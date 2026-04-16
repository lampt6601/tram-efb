import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh Lý Tài Khoản eFootball",
  description:
    "Đăng yêu cầu thanh lý tài khoản eFootball của bạn. Người thu mua phù hợp sẽ liên hệ trực tiếp, quy trình đơn giản và miễn phí.",
  alternates: {
    canonical: "https://thc-efb.com/sell",
  },
  openGraph: {
    title: "Thanh Lý Tài Khoản eFootball | Sạp Acc eFootball",
    description:
      "Đăng yêu cầu thanh lý tài khoản eFootball. Người thu mua phù hợp sẽ liên hệ bạn trực tiếp.",
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
