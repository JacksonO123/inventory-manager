ALTER TABLE "reservation" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "item_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "borrower" text NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_borrower_user_id_fk" FOREIGN KEY ("borrower") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reservation_item_start_idx" ON "reservation" USING btree ("item_id","start");--> statement-breakpoint
CREATE INDEX "reservation_org_start_idx" ON "reservation" USING btree ("org_id","start");--> statement-breakpoint
CREATE INDEX "reservation_borrower_idx" ON "reservation" USING btree ("borrower");