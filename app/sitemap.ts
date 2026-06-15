import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Normalize base URL by removing any trailing slash
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click").replace(/\/$/, "");

  return [
    {
      url: `${baseUrl}/`, // Explicit trailing slash to match canonical "/"
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
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
