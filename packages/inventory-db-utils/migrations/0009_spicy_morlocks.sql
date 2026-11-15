ALTER TABLE "item" ADD COLUMN "is_available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "item" ADD COLUMN "is_lent_out" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "item" ADD COLUMN "is_damaged" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "item" DROP COLUMN "status";