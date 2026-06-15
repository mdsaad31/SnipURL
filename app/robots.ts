import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Normalize base URL by removing any trailing slash
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/api/",
          "/api/*",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
