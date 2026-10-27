CREATE TABLE "basic_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "basic_user_email_unique" UNIQUE("email")
);
