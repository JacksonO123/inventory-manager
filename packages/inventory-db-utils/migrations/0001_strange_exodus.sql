CREATE TABLE "event" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "status" NOT NULL,
	"start" date NOT NULL,
	"end" date NOT NULL,
	"all_day" boolean NOT NULL
);
