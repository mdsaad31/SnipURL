import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { withApiAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { urlSchema, fetchUrlTitle } from "@/lib/url-utils";
import { createUniqueShortCode, isValidCustomAlias, isAliasAvailable } from "@/lib/short-code";
import { eq, and, inArray, count } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const MAX_BULK = 50;

const bulkCreateSchema = z.object({
  links: z.array(z.object({
    url: urlSchema,
    custom_alias: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    expires_at: z.string().datetime({ offset: true }).optional().nullable(),
  })).min(1).max(MAX_BULK),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(MAX_BULK),
});

export const POST = withApiAuth(async (req, { user }) => {
  const body = await req.json();
  const parsed = bulkCreateSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", `Invalid request. Provide 1-${MAX_BULK} links.`, 400, parsed.error.format());
  }

  // Enforce link limit
  const [linkCount] = await db
    .select({ count: count() })
    .from(links)
    .where(eq(links.user_id, user.id));

  const currentCount = linkCount?.count ?? 0;
  const requested = parsed.data.links.length;

  if (currentCount + requested > user.link_limit) {
    return apiError("FORBIDDEN", `Link limit would be exceeded. Current: ${currentCount}, limit: ${user.link_limit}, requested: ${requested}.`, 403);
  }

  const results: { success: unknown[]; failed: { index: number; error: string }[] } = {
    success: [],
    failed: [],
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";

  for (let i = 0; i < parsed.data.links.length; i++) {
    const item = parsed.data.links[i];
    try {
      let shortCode: string;
      if (item.custom_alias) {
        const aliasCheck = isValidCustomAlias(item.custom_alias);
        if (!aliasCheck.valid) {
          results.failed.push({ index: i, error: aliasCheck.reason || "Invalid alias" });
          continue;
        }
        const available = await isAliasAvailable(item.custom_alias);
        if (!available) {
          results.failed.push({ index: i, error: "Alias already taken" });
          continue;
        }
        shortCode = item.custom_alias;
      } else {
        shortCode = await createUniqueShortCode();
      }

      const fetchedTitle = await fetchUrlTitle(item.url);
      const finalTitle = item.title?.trim() || fetchedTitle || item.url;

      let passwordHash: string | null = null;
      if (item.password) {
        passwordHash = await bcrypt.hash(item.password, 10);
      }

      let resolvedExpiresAt: Date | null = item.expires_at ? new Date(item.expires_at) : null;
      if (!resolvedExpiresAt && user.default_expiry_hours) {
        resolvedExpiresAt = new Date();
        resolvedExpiresAt.setHours(resolvedExpiresAt.getHours() + user.default_expiry_hours);
      }

      const [newLink] = await db
        .insert(links)
        .values({
          original_url: item.url,
          short_code: shortCode,
          user_id: user.id,
          title: finalTitle,
          password_hash: passwordHash,
          expires_at: resolvedExpiresAt,
        })
        .returning();

      results.success.push({
        id: newLink.id,
        short_code: newLink.short_code,
        short_url: `${appUrl}/${newLink.short_code}`,
        original_url: newLink.original_url,
        title: newLink.title,
        created_at: newLink.created_at,
      });
    } catch {
      results.failed.push({ index: i, error: "Internal error creating link" });
    }
  }

  return apiSuccess(results, 201);
});

export const DELETE = withApiAuth(async (req, { user }) => {
  const body = await req.json();
  const parsed = bulkDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", `Invalid request. Provide 1-${MAX_BULK} link IDs.`, 400, parsed.error.format());
  }

  const result = await db
    .delete(links)
    .where(and(inArray(links.id, parsed.data.ids), eq(links.user_id, user.id)))
    .returning({ id: links.id });

  return apiSuccess({ deleted: result.length });
});
