import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@thc-efb/shared", "@thc-efb/supabase", "@thc-efb/ui"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    unoptimized: true,
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
};

export default nextConfig;
