DROP INDEX "channel_id_created_at_idx";--> statement-breakpoint
ALTER TABLE "descriptions" ADD COLUMN "category" varchar(20);--> statement-breakpoint
CREATE INDEX "channel_id_category_created_at_idx" ON "descriptions" USING btree ("channel_id","category","created_at","id");