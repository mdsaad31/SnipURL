import { db } from "./db";
import { clicks } from "./db/schema";
import { env } from "./env";
import { sql } from "drizzle-orm";
import crypto from "crypto";

export function hashIp(ip: string): string {
  if (!ip) return "unknown";
  return crypto
    .createHmac("sha256", env.IP_HASH_SALT)
    .update(ip)
    .digest("hex");
}

// ─── Simple UA Parser ───────────────────────────────────────────────
// Lightweight regex-based parsing — no external dependency needed.

function parseDeviceType(ua: string): string {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  return "Other";
}

function parseOS(ua: string): string {
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua) && !/android/i.test(ua)) return "Linux";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  return "Other";
}

// ─── Types ──────────────────────────────────────────────────────────

export interface ClickData {
  linkId: string;
  ip: string;
  userAgentStr: string;
  referrer: string;
  country?: string;
  city?: string;
}

// ─── Log Click ──────────────────────────────────────────────────────

export async function logClick(data: ClickData) {
  try {
    const deviceType = parseDeviceType(data.userAgentStr);
    const browser = parseBrowser(data.userAgentStr);
    const os = parseOS(data.userAgentStr);

    // Use a transaction so the count update and click insert are atomic
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        UPDATE links 
        SET clicks_count = clicks_count + 1 
        WHERE id = ${data.linkId}
      `);

      await tx.insert(clicks).values({
        link_id: data.linkId,
        ip_hash: hashIp(data.ip),
        user_agent: data.userAgentStr,
        referrer: data.referrer || "Direct",
        country: data.country || null,
        city: data.city || null,
        device_type: deviceType,
        browser,
        os,
      });
    });
  } catch (error) {
    console.error("Failed to log click:", error);
    // Analytics failures must never break the redirect
  }
}
