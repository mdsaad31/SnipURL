ALTER TABLE "links" DROP CONSTRAINT "links_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_link_id_created_at_idx" ON "clicks" USING btree ("link_id","created_at");--> statement-breakpoint
CREATE INDEX "links_user_id_created_at_idx" ON "links" USING btree ("user_id","created_at");