import { createHash } from "crypto";
import { customAlphabet } from "nanoid";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const KEY_LENGTH = 32;
const KEY_PREFIX = "snip_live_";

export const MAX_KEYS_PER_USER = 10;

export function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const nanoid = customAlphabet(ALPHABET, KEY_LENGTH);
  const randomPart = nanoid();
  const fullKey = `${KEY_PREFIX}${randomPart}`;
  const prefix = `${KEY_PREFIX}${randomPart.slice(0, 7)}`;
  const hash = hashApiKey(fullKey);
  return { fullKey, prefix, hash };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
