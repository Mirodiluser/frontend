import type { MetadataRoute } from "next";

const siteUrl = "https://tahrirai.uz";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl + "/",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: siteUrl + "/about",
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
