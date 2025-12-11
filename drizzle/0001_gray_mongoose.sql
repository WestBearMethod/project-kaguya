ALTER TABLE "descriptions" DROP CONSTRAINT "descriptions_channel_id_users_channel_id_fk";
--> statement-breakpoint
ALTER TABLE "descriptions" ADD CONSTRAINT "descriptions_channel_id_users_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."users"("channel_id") ON DELETE cascade ON UPDATE cascade;