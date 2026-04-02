import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký Bán Acc eFootball | THC eFootball Shop",
  description:
    "Đăng ký bán acc eFootball tại THC eFootball Shop. Tự đăng acc miễn phí, giao dịch an toàn qua trung gian.",
  alternates: {
    canonical: "https://thc-efb.com/seller/apply",
  },
  openGraph: {
    title: "Đăng Ký Bán Acc eFootball | THC eFootball Shop",
    description:
      "Đăng ký bán acc eFootball tại THC Shop. Tiếp cận hàng trăm khách mua mỗi ngày.",
    url: "/seller/apply",
  },
};

export default function SellerApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
