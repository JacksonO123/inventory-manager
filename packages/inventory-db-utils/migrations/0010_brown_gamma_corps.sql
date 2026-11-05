CREATE TABLE "org_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"positions" jsonb,
	CONSTRAINT "org_positions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "org_positions" ADD CONSTRAINT "org_positions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "location";