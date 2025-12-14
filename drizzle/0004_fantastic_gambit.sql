DROP INDEX "channel_id_created_at_idx";--> statement-breakpoint
CREATE INDEX "channel_id_created_at_idx" ON "descriptions" USING btree ("channel_id","created_at","id");