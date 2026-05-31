import { z } from "zod";

export const urlSchema = z.string().url("Please enter a valid URL").refine((url) => {
  try {
    const parsedUrl = new URL(url);
    // Block dangerous schemes
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return false;
    }
    // Block internal IPs in production
    if (process.env.NODE_ENV === "production") {
      const hostname = parsedUrl.hostname;
      if (
        hostname === "localhost" ||
        hostname.startsWith("127.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("172.16.") ||
        hostname.startsWith("172.17.") ||
        hostname.startsWith("172.18.") ||
        hostname.startsWith("172.19.") ||
        hostname.startsWith("172.2") ||
        hostname.startsWith("172.30.") ||
        hostname.startsWith("172.31.")
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}, "Invalid URL");

export async function fetchUrlTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "SnipURLBot/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    if (titleMatch?.[1]) {
      return titleMatch[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
        .substring(0, 255);
    }

    return null;
  } catch {
    return null;
  }
}
