import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "THC Admin — eFootball Shop",
    short_name: "THC Admin",
    description:
      "Quản trị THC eFootball Shop — quản lý tài khoản, đơn hàng, đánh giá.",
    start_url: "/dashboard",
    scope: "/",
    id: "/dashboard",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#f8fafc",
    orientation: "portrait-primary",
    categories: ["business", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
