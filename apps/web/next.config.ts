import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@thc-efb/shared", "@thc-efb/supabase", "@thc-efb/ui"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    scrollRestoration: true
  },
  images: {
    unoptimized: true, // Use ImageKit CDN transformations instead of Vercel (saves bandwidth)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        // Khớp với tất cả các đường dẫn
        source: '/:path*', 
        // Chuyển hướng sang domain mới kèm theo đường dẫn cũ
        destination: 'https://thc-efb.com/:path*', 
        // true = 301 (vĩnh viễn), false = 302 (tạm thời)
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
