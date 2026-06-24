import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { withApiAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { urlSchema, fetchUrlTitle } from "@/lib/url-utils";
import { createUniqueShortCode, isValidCustomAlias, isAliasAvailable } from "@/lib/short-code";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createLinkSchema = z.object({
  url: urlSchema,
  custom_alias: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  expires_at: z.string().datetime({ offset: true }).optional().nullable(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  is_active: z.enum(["true", "false"]).optional(),
});

export const GET = withApiAuth(async (req, { user }) => {
  const url = new URL(req.url);
  const parsed = listQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    per_page: url.searchParams.get("per_page") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    is_active: url.searchParams.get("is_active") ?? undefined,
  });

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query parameters.", 400, parsed.error.format());
  }

  const { page, per_page, search, is_active } = parsed.data;
  const offset = (page - 1) * per_page;

  const conditions = [eq(links.user_id, user.id)];
  if (is_active !== undefined) {
    conditions.push(eq(links.is_active, is_active === "true"));
  }
  if (search) {
    conditions.push(
      sql`(${links.original_url} ILIKE ${"%" + search + "%"} OR ${links.short_code} ILIKE ${"%" + search + "%"} OR ${links.title} ILIKE ${"%" + search + "%"})`
    );
  }

  const where = and(...conditions);

  const [userLinks, totalResult] = await Promise.all([
    db.query.links.findMany({
      where,
      orderBy: [desc(links.created_at)],
      limit: per_page,
      offset,
    }),
    db.select({ count: count() }).from(links).where(where),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";

  const data = userLinks.map((link) => ({
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
    created_at: link.created_at,
    updated_at: link.updated_at,
  }));

  return apiSuccess(data, 200, {
    page,
    per_page,
    total,
    total_pages: Math.ceil(total / per_page),
  });
});

export const POST = withApiAuth(async (req, { user }) => {
  const body = await req.json();
  const parsed = createLinkSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request data.", 400, parsed.error.format());
  }

  const { url, custom_alias, password, expires_at } = parsed.data;

  // Enforce link limit
  const [linkCount] = await db
    .select({ count: count() })
    .from(links)
    .where(eq(links.user_id, user.id));

  if ((linkCount?.count ?? 0) >= user.link_limit) {
    return apiError("FORBIDDEN", `Link limit reached (${user.link_limit}). Delete existing links or upgrade your plan.`, 403);
  }

  let shortCode: string;
  if (custom_alias) {
    const aliasCheck = isValidCustomAlias(custom_alias);
    if (!aliasCheck.valid) {
      return apiError("VALIDATION_ERROR", aliasCheck.reason || "Invalid custom alias.", 400);
    }
    const available = await isAliasAvailable(custom_alias);
    if (!available) {
      return apiError("CONFLICT", "This custom alias is already taken.", 409);
    }
    shortCode = custom_alias;
  } else {
    shortCode = await createUniqueShortCode();
  }

  const fetchedTitle = await fetchUrlTitle(url);
  const finalTitle = parsed.data.title?.trim() || fetchedTitle || url;

  let passwordHash: string | null = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  let resolvedExpiresAt: Date | null = expires_at ? new Date(expires_at) : null;
  if (!resolvedExpiresAt && user.default_expiry_hours) {
    resolvedExpiresAt = new Date();
    resolvedExpiresAt.setHours(resolvedExpiresAt.getHours() + user.default_expiry_hours);
  }

  const [newLink] = await db
    .insert(links)
    .values({
      original_url: url,
      short_code: shortCode,
      user_id: user.id,
      title: finalTitle,
      password_hash: passwordHash,
      expires_at: resolvedExpiresAt,
    })
    .returning();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";

  return apiSuccess({
    id: newLink.id,
    short_code: newLink.short_code,
    short_url: `${appUrl}/${newLink.short_code}`,
    original_url: newLink.original_url,
    title: newLink.title,
    is_active: newLink.is_active,
    has_password: !!newLink.password_hash,
    expires_at: newLink.expires_at,
    clicks_count: newLink.clicks_count,
    analytics_public: newLink.analytics_public,
    created_at: newLink.created_at,
    updated_at: newLink.updated_at,
  }, 201);
});
