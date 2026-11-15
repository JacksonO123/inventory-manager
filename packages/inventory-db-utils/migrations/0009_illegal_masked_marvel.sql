CREATE TABLE "org_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"positions" jsonb NOT NULL,
	CONSTRAINT "org_positions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "org_positions" ADD CONSTRAINT "org_positions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "org_positions_user_id_index" ON "org_positions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_user_id_index" ON "admin" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "super_admin_user_id_index" ON "super_admin" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "super_admin" ADD CONSTRAINT "super_admin_user_id_unique" UNIQUE("user_id");