ALTER TABLE "users" ADD COLUMN "default_expiry_hours" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "link_limit" integer DEFAULT 500 NOT NULL;