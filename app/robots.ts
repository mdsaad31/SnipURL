import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"
  ).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/_next/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
