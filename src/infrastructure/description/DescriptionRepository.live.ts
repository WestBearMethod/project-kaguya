import { and, desc, eq, isNull } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { db } from "@/db";
import { descriptions, users } from "@/db/schema";
import type {
  Description,
  DescriptionContent,
  DescriptionSummary,
} from "@/domain/description/Description";
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
          .select({
            id: descriptions.id,
            title: descriptions.title,
            createdAt: descriptions.createdAt,
          })
          .from(descriptions)
          .where(
            and(
              eq(descriptions.channelId, channelId),
              isNull(descriptions.deletedAt),
            ),
          )
          .orderBy(desc(descriptions.createdAt));
        return results as DescriptionSummary[];
      },
      catch: (error) => new Error(String(error)),
    }),

  findById: (id) =>
    Effect.tryPromise({
      try: async () => {
        const [result] = await db
          .select({
            content: descriptions.content,
          })
          .from(descriptions)
          .where(and(eq(descriptions.id, id), isNull(descriptions.deletedAt)))
          .limit(1);
        return result ? (result as DescriptionContent) : null;
      },
      catch: (error) => new Error(String(error)),
    }),

  softDelete: (id) =>
    Effect.tryPromise({
      try: async () => {
        const [deleted] = await db
          .update(descriptions)
          .set({ deletedAt: new Date() })
          .where(and(eq(descriptions.id, id), isNull(descriptions.deletedAt)))
          .returning();

        if (!deleted) {
          throw new Error(`Description with id ${id} not found`);
        }

        return deleted as Description;
      },
      catch: (error) => new Error(String(error)),
    }),
});
