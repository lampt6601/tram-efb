import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký Bán Acc eFootball | Sạp Acc eFootball",
  description:
    "Đăng ký bán acc eFootball tại Sạp Acc eFootball. Tự đăng acc miễn phí, quy trình kiểm duyệt rõ ràng.",
  alternates: {
    canonical: "https://sap-efb.vercel.app/seller/apply",
  },
  openGraph: {
    title: "Đăng Ký Bán Acc eFootball | Sạp Acc eFootball",
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
