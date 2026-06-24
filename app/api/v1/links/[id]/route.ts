import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { withApiAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateLinkSchema = z.object({
  title: z.string().optional(),
  is_active: z.boolean().optional(),
  password: z.string().nullable().optional(),
  expires_at: z.string().datetime({ offset: true }).nullable().optional(),
  analytics_public: z.boolean().optional(),
  analytics_shared_fields: z.array(z.string()).nullable().optional(),
});

export const GET = withApiAuth(async (req, { user, params }) => {
  const link = await db.query.links.findFirst({
    where: and(eq(links.id, params.id), eq(links.user_id, user.id)),
  });

  if (!link) {
    return apiError("NOT_FOUND", "Link not found.", 404);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";

  return apiSuccess({
    id: link.id,
    short_code: link.short_code,
    short_url: `${appUrl}/${link.short_code}`,
    original_url: link.original_url,
    title: link.title,
    is_active: link.is_active,
    has_password: !!link.password_hash,
    expires_at: link.expires_at,
    clicks_count: link.clicks_count,
    analytics_public: link.analytics_public,
    analytics_shared_fields: link.analytics_shared_fields ? JSON.parse(link.analytics_shared_fields) : null,
    created_at: link.created_at,
    updated_at: link.updated_at,
  });
});

export const PATCH = withApiAuth(async (req, { user, params }) => {
  const body = await req.json();

  if (body.original_url !== undefined || body.short_code !== undefined || body.url !== undefined) {
    return apiError("BAD_REQUEST", "URL and alias cannot be changed after creation.", 400);
  }

  const parsed = updateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request data.", 400, parsed.error.format());
  }

  const link = await db.query.links.findFirst({
    where: and(eq(links.id, params.id), eq(links.user_id, user.id)),
  });

  if (!link) {
    return apiError("NOT_FOUND", "Link not found.", 404);
  }

  const updateData: Record<string, unknown> = { updated_at: new Date() };

  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.is_active !== undefined) updateData.is_active = parsed.data.is_active;
  if (parsed.data.analytics_public !== undefined) updateData.analytics_public = parsed.data.analytics_public;

  if (parsed.data.analytics_shared_fields !== undefined) {
    updateData.analytics_shared_fields = parsed.data.analytics_shared_fields
      ? JSON.stringify(parsed.data.analytics_shared_fields)
      : null;
  }

  if (parsed.data.password !== undefined) {
    if (parsed.data.password === null) {
      updateData.password_hash = null;
    } else if (parsed.data.password.length > 0) {
      updateData.password_hash = await bcrypt.hash(parsed.data.password, 10);
    }
  }

  if (parsed.data.expires_at !== undefined) {
    updateData.expires_at = parsed.data.expires_at ? new Date(parsed.data.expires_at) : null;
  }

  const [updatedLink] = await db
    .update(links)
    .set(updateData)
    .where(and(eq(links.id, params.id), eq(links.user_id, user.id)))
    .returning();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";

  return apiSuccess({
    id: updatedLink.id,
    short_code: updatedLink.short_code,
    short_url: `${appUrl}/${updatedLink.short_code}`,
    original_url: updatedLink.original_url,
    title: updatedLink.title,
    is_active: updatedLink.is_active,
    has_password: !!updatedLink.password_hash,
    expires_at: updatedLink.expires_at,
    clicks_count: updatedLink.clicks_count,
    analytics_public: updatedLink.analytics_public,
    created_at: updatedLink.created_at,
    updated_at: updatedLink.updated_at,
  });
});

export const DELETE = withApiAuth(async (req, { user, params }) => {
  const link = await db.query.links.findFirst({
    where: and(eq(links.id, params.id), eq(links.user_id, user.id)),
  });

  if (!link) {
    return apiError("NOT_FOUND", "Link not found.", 404);
  }

  await db.delete(links).where(and(eq(links.id, params.id), eq(links.user_id, user.id)));

  return apiSuccess({ deleted: true });
});
