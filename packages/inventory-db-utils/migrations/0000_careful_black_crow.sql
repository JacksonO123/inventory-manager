CREATE TYPE "public"."item_status" AS ENUM('available', 'booked', 'out_of_service');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp (6) with time zone,
	"refresh_token_expires_at" timestamp (6) with time zone,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "admin_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "checkout" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"borrower_id" text NOT NULL,
	"checked_out_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"returned_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "item" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "item_status" DEFAULT 'available' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"positions" jsonb NOT NULL,
	CONSTRAINT "org_positions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"svg_data_url" text,
	"path" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp (6) with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "super_admin" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "super_admin_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp (6) with time zone NOT NULL,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout" ADD CONSTRAINT "checkout_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout" ADD CONSTRAINT "checkout_borrower_id_user_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_positions" ADD CONSTRAINT "org_positions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "super_admin" ADD CONSTRAINT "super_admin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_user_id_index" ON "admin" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_open_item_idx" ON "checkout" USING btree ("item_id") WHERE "checkout"."returned_at" is null;--> statement-breakpoint
CREATE INDEX "checkout_borrowerId_idx" ON "checkout" USING btree ("borrower_id");--> statement-breakpoint
CREATE INDEX "org_positions_user_id_index" ON "org_positions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organization_path_index" ON "organization" USING btree ("path");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "super_admin_user_id_index" ON "super_admin" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");