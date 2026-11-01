CREATE TABLE "checkout" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"borrower_id" integer NOT NULL,
	"checked_out_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"returned_at" timestamp (6) with time zone
);
--> statement-breakpoint
ALTER TABLE "checkout" ADD CONSTRAINT "checkout_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout" ADD CONSTRAINT "checkout_borrower_id_basic_user_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."basic_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_open_item_idx" ON "checkout" USING btree ("item_id") WHERE "checkout"."returned_at" is null;--> statement-breakpoint
CREATE INDEX "checkout_borrowerId_idx" ON "checkout" USING btree ("borrower_id");