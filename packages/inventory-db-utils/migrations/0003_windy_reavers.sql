ALTER TABLE "message_table" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "message_table" CASCADE;--> statement-breakpoint
ALTER TABLE "item" ALTER COLUMN "description" DROP NOT NULL;