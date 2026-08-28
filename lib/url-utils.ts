import { z } from "zod";

export const urlSchema = z.string().trim().max(2048, "URL must be 2,048 characters or fewer").url("Please enter a valid URL").refine((url) => {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}, "Invalid URL");
