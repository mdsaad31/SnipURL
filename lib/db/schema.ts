import { pgTable, text, timestamp, boolean, uuid, integer, varchar } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── Users ──────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  clerk_id: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  default_expiry_hours: integer("default_expiry_hours"),
  link_limit: integer("link_limit").default(500).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
}));

// ─── Links ──────────────────────────────────────────────────────────
export const links = pgTable("links", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  original_url: text("original_url").notNull(),
  short_code: varchar("short_code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }),
  clicks_count: integer("clicks_count").default(0).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  password_hash: varchar("password_hash", { length: 255 }),
  expires_at: timestamp("expires_at"),
  analytics_public: boolean("analytics_public").default(false).notNull(),
  analytics_shared_fields: text("analytics_shared_fields"), // JSON array of visible sections
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, {
    fields: [links.user_id],
    references: [users.id],
  }),
  clicks: many(clicks),
}));

// ─── Clicks ─────────────────────────────────────────────────────────
export const clicks = pgTable("clicks", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  link_id: uuid("link_id").references(() => links.id, { onDelete: "cascade" }).notNull(),
  ip_hash: varchar("ip_hash", { length: 255 }),
  user_agent: text("user_agent"),
  referrer: text("referrer"),
  country: varchar("country", { length: 2 }),
  city: varchar("city", { length: 100 }),
  device_type: varchar("device_type", { length: 50 }),
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, {
    fields: [clicks.link_id],
    references: [links.id],
  }),
}));
