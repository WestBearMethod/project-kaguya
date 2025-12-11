CREATE TABLE "descriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"channel_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" varchar(24) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_channel_id_unique" UNIQUE("channel_id")
);
--> statement-breakpoint
ALTER TABLE "descriptions" ADD CONSTRAINT "descriptions_channel_id_users_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."users"("channel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "channel_id_idx" ON "descriptions" USING btree ("channel_id");