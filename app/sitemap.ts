import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"
  ).replace(/\/$/, "");

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date("2026-06-20"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date("2026-06-20"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/termsofservice`,
      lastModified: new Date("2026-06-06"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacystatement`,
      lastModified: new Date("2026-06-06"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
