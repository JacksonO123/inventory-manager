ALTER TABLE "basic_user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "basic_user" CASCADE;--> statement-breakpoint
ALTER TABLE "checkout" DROP CONSTRAINT "checkout_borrower_id_basic_user_id_fk";
--> statement-breakpoint
ALTER TABLE "checkout" ALTER COLUMN "borrower_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "checkout" ADD CONSTRAINT "checkout_borrower_id_user_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
