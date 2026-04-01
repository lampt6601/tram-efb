import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yêu Cầu Tìm Tài Khoản eFootball",
  description:
    "Gửi yêu cầu tìm tài khoản eFootball theo ý muốn. Đội ngũ THC eFootball Shop sẽ tìm kiếm và liên hệ bạn trong thời gian sớm nhất.",
  alternates: {
    canonical: "https://thc-efb.com/request",
  },
  openGraph: {
    title: "Yêu Cầu Tìm Tài Khoản eFootball | THC EFB",
    description:
      "Gửi yêu cầu tìm tài khoản eFootball theo ý muốn. Đội ngũ THC sẽ tìm và liên hệ sớm nhất.",
    url: "/request",
    type: "website",
  },
};

export default function RequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
