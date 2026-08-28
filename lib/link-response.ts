import type { links } from "./db/schema";

type Link = typeof links.$inferSelect;

/** A browser-safe representation of a short link. */
export function toLinkResponse(link: Link) {
  const { password_hash, ...safeLink } = link;
  return {
    ...safeLink,
    has_password: Boolean(password_hash),
  };
}
