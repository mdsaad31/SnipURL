import { customAlphabet } from "nanoid";
import { db } from "./db";
import { links } from "./db/schema";
import { eq } from "drizzle-orm";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DEFAULT_LENGTH = 6;

// Reserved words that cannot be used as custom aliases.
// This includes all known app routes, public pages, system paths, and
// any word that could be confused with a system page.
const RESERVED_WORDS = new Set([
  // ── App routes ──────────────────────────────────────────────────
  "api", "dashboard", "login", "register", "sign-in", "sign-up", "sign-out",
  "signin", "signup", "signout", "admin", "settings", "pricing", "about",
  "contact", "terms", "privacy", "blog", "support", "help", "account",
  "profile", "billing", "upgrade", "plan", "plans", "features",
  // ── Known public pages ──────────────────────────────────────────
  "termsofservice", "privacystatement", "privacypolicy", "analytics",
  "qr", "qr-codes", "qrcodes", "feedback", "report",
  // ── Well-known web paths ────────────────────────────────────────
  "www", "mail", "smtp", "ftp", "cdn", "static", "assets", "images",
  "files", "uploads", "public", "private", "robots", "sitemap", "favicon",
  "icon", "health", "status", "ping", "webhook", "webhooks", "callback",
  "oauth", "auth", "authentication", "authorization",
  // ── Brand / misleading ──────────────────────────────────────────
  "snip", "snipurl", "root", "system", "null", "undefined", "true", "false",
  "new", "edit", "delete", "create", "update", "search", "app", "web",
  "test", "demo", "example", "sample", "placeholder",
  // ── Common confusing words ───────────────────────────────────────
  "home", "index", "main", "link", "links", "url", "redirect", "go",
  "click", "track", "tracking", "stats", "code", "share", "user", "users",
  // ── HTTP/system responses ────────────────────────────────────────
  "404", "500", "403", "401", "error", "not-found", "notfound", "forbidden",
]);

export function generateShortCode(length = DEFAULT_LENGTH): string {
  const nanoid = customAlphabet(ALPHABET, length);
  return nanoid();
}

export function isValidCustomAlias(alias: string): {
  valid: boolean;
  reason?: string;
} {
  if (alias.length < 3) return { valid: false, reason: "Alias must be at least 3 characters." };
  if (alias.length > 50) return { valid: false, reason: "Alias must be 50 characters or fewer." };
  if (RESERVED_WORDS.has(alias.toLowerCase())) {
    return { valid: false, reason: `"${alias}" is a reserved word and cannot be used as an alias.` };
  }
  // Only allow alphanumeric characters and hyphens, no leading/trailing hyphens
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(alias) && !/^[a-zA-Z0-9]$/.test(alias)) {
    return { valid: false, reason: "Alias can only contain letters, numbers, and hyphens. It cannot start or end with a hyphen." };
  }
  if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
    return { valid: false, reason: "Alias can only contain letters, numbers, and hyphens." };
  }
  return { valid: true };
}

export async function isAliasAvailable(alias: string): Promise<boolean> {
  const existingLink = await db.query.links.findFirst({
    where: eq(links.short_code, alias),
  });
  return !existingLink;
}

export async function createUniqueShortCode(length = DEFAULT_LENGTH): Promise<string> {
  let shortCode = generateShortCode(length);
  let isAvailable = await isAliasAvailable(shortCode);
  
  let attempts = 0;
  const MAX_ATTEMPTS = 10;

  while (!isAvailable && attempts < MAX_ATTEMPTS) {
    shortCode = generateShortCode(length);
    isAvailable = await isAliasAvailable(shortCode);
    attempts++;
  }

  if (!isAvailable) {
    throw new Error("Could not generate a unique short code. Please try again.");
  }

  return shortCode;
}
