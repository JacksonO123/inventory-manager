CREATE TABLE "org_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"item_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "org_item" ADD CONSTRAINT "org_item_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_item" ADD CONSTRAINT "org_item_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;