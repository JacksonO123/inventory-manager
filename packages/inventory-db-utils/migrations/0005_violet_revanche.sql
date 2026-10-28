CREATE TYPE "public"."item_status" AS ENUM('available', 'booked', 'out_of_service');--> statement-breakpoint
ALTER TABLE "item" ADD COLUMN "status" "item_status" DEFAULT 'available' NOT NULL;