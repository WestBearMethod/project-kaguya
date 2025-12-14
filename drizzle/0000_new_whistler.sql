CREATE TABLE "descriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
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
ALTER TABLE "descriptions" ADD CONSTRAINT "descriptions_channel_id_users_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."users"("channel_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "channel_id_category_created_at_idx" ON "descriptions" USING btree ("channel_id","category","created_at","id");