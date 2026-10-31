import type { MetadataRoute } from "next";

const siteUrl = "https://tahrirai.uz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin pages declare robots: noindex in their own metadata.\n        // Blocking them here would prevent crawlers from seeing that directive.\n        disallow: ["/api/"],
      },
    ],
    sitemap: siteUrl + "/sitemap.xml",
    host: siteUrl,
  };
}
