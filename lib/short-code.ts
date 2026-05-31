import { customAlphabet } from "nanoid";
import { db } from "./db";
import { links } from "./db/schema";
import { eq } from "drizzle-orm";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DEFAULT_LENGTH = 6;

// Reserved words that cannot be used as custom aliases
const RESERVED_WORDS = new Set([
  "api",
  "dashboard",
  "login",
  "register",
  "sign-in",
  "sign-up",
  "admin",
  "settings",
  "pricing",
  "about",
  "contact",
  "terms",
  "privacy",
  "blog",
  "support",
  "help",
]);

export function generateShortCode(length = DEFAULT_LENGTH): string {
  const nanoid = customAlphabet(ALPHABET, length);
  return nanoid();
}

export function isValidCustomAlias(alias: string): boolean {
  if (alias.length < 3 || alias.length > 50) return false;
  if (RESERVED_WORDS.has(alias.toLowerCase())) return false;
  // Only allow alphanumeric characters and hyphens
  return /^[a-zA-Z0-9-]+$/.test(alias);
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
