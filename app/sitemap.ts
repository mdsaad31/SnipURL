import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"
  ).replace(/\/$/, "");

  const docsUrl = "https://docs.snipurl.click";

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
      url: docsUrl,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${docsUrl}/getting-started`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${docsUrl}/getting-started/authentication`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${docsUrl}/getting-started/rate-limits`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${docsUrl}/api-reference`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${docsUrl}/api-reference/links/create`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${docsUrl}/api-reference/links/list`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${docsUrl}/api-reference/analytics/link-stats`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${docsUrl}/api-reference/qr-codes/generate`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${docsUrl}/errors`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${docsUrl}/sdks`,
      lastModified: new Date("2026-06-25"),
      changeFrequency: "monthly",
      priority: 0.5,
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
