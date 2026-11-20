ALTER TABLE "reservation" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "item_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reservation_item_id_idx" ON "reservation" USING btree ("item_id");--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_org_item_unique" UNIQUE("org_id","item_id");