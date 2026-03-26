import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký Bán Acc eFootball | Trở Thành CTV Bán Hàng",
  description:
    "Đăng ký trở thành cộng tác viên bán acc eFootball tại THC eFootball Shop. Mở gian hàng miễn phí, tự đăng acc, giao dịch an toàn qua trung gian.",
  alternates: {
    canonical: "https://thc-efb.com/seller/apply",
  },
  openGraph: {
    title: "Đăng Ký Bán Acc eFootball | THC eFootball Shop",
    description:
      "Trở thành cộng tác viên bán hàng tại THC eFootball Shop. Gian hàng riêng, tiếp cận hàng trăm khách mua mỗi ngày.",
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
