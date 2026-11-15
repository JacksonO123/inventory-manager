CREATE TABLE "organization" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"location" integer NOT NULL,
	"svg_data_url" text,
	"path" text NOT NULL
);
