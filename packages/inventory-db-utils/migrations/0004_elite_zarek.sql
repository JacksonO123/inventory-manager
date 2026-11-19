CREATE TABLE "org_member" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"org_id" integer NOT NULL,
	CONSTRAINT "org_member_user_org_unique" UNIQUE("user_id","org_id")
);
--> statement-breakpoint
DROP INDEX "admin_user_id_index";--> statement-breakpoint
DROP INDEX "org_positions_user_id_index";--> statement-breakpoint
DROP INDEX "super_admin_user_id_index";--> statement-breakpoint
ALTER TABLE "org_member" ADD CONSTRAINT "org_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_member" ADD CONSTRAINT "org_member_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "org_member_org_id_index" ON "org_member" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "org_item_item_id_idx" ON "org_item" USING btree ("item_id");--> statement-breakpoint
ALTER TABLE "org_item" ADD CONSTRAINT "org_item_org_item_unique" UNIQUE("org_id","item_id");