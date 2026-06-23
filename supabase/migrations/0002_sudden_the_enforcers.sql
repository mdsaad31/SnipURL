ALTER TABLE "links" ADD COLUMN "analytics_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "analytics_shared_fields" text;