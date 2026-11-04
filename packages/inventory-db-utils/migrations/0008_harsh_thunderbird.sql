CREATE INDEX "admin_user_id_index" ON "admin" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "super_admin_user_id_index" ON "super_admin" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "super_admin" ADD CONSTRAINT "super_admin_user_id_unique" UNIQUE("user_id");