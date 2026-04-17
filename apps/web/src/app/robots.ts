import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow legitimate crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // Block known aggressive SEO scrapers that inflate serverless invocations
      // These bots ignore content but still trigger server-side rendering
      { userAgent: "AhrefsBot", disallow: "/" },
      { userAgent: "SemrushBot", disallow: "/" },
      { userAgent: "MJ12bot", disallow: "/" },
      { userAgent: "DotBot", disallow: "/" },
      { userAgent: "BLEXBot", disallow: "/" },
      { userAgent: "PetalBot", disallow: "/" },
      { userAgent: "YandexBot", disallow: "/" },
      { userAgent: "Baiduspider", disallow: "/" },
      { userAgent: "serpstatbot", disallow: "/" },
      { userAgent: "DataForSeoBot", disallow: "/" },
    ],
    sitemap: "https://sap-efb.vercel.app/sitemap.xml",
  };
}
