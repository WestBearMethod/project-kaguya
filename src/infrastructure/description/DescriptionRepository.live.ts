import { desc, eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { db } from "@/db";
import { descriptions, users } from "@/db/schema";
import type { Description } from "@/domain/description/Description";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";

export const DescriptionRepositoryLive = Layer.succeed(DescriptionRepository, {
  save: (descriptionData) =>
    Effect.tryPromise({
      try: async () => {
        // Ensure user exists
        await db
          .insert(users)
          .values({ channelId: descriptionData.channelId })
          .onConflictDoNothing({ target: users.channelId });

        const [saved] = await db
          .insert(descriptions)
          .values({
            title: descriptionData.title,
            content: descriptionData.content,
            channelId: descriptionData.channelId,
          })
          .returning();

        return saved as Description;
      },
      catch: (error) => new Error(String(error)),
    }),

  findByChannelId: (channelId) =>
    Effect.tryPromise({
      try: async () => {
        const results = await db
          .select()
          .from(descriptions)
          .where(eq(descriptions.channelId, channelId))
          .orderBy(desc(descriptions.createdAt));
        return results as Description[];
      },
      catch: (error) => new Error(String(error)),
    }),
});
