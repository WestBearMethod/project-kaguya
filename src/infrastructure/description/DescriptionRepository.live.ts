import { and, desc, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import { db } from "@/db";
import { descriptions, users } from "@/db/schema";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import type {
  DescriptionContent,
  DescriptionSummary,
} from "@/domain/description/dtos";
import type { Description } from "@/domain/description/entities";

export const DescriptionRepositoryLive = Layer.succeed(DescriptionRepository, {
  save: (command) =>
    Effect.tryPromise({
      try: async () => {
        // Ensure user exists
        await db
          .insert(users)
          .values({ channelId: command.channelId })
          .onConflictDoNothing({ target: users.channelId });

        const [saved] = await db
          .insert(descriptions)
          .values({
            title: command.title,
            content: command.content,
            channelId: command.channelId,
          })
          .returning();

        return saved as Description;
      },
      catch: (error) => new Error(String(error)),
    }),

  findByChannelId: (query) =>
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
              eq(descriptions.channelId, query.channelId),
              isNull(descriptions.deletedAt),
            ),
          )
          .orderBy(desc(descriptions.createdAt));
        return results as DescriptionSummary[];
      },
      catch: (error) => new Error(String(error)),
    }),

  findById: (query) =>
    Effect.tryPromise({
      try: async () => {
        const [result] = await db
          .select({
            content: descriptions.content,
          })
          .from(descriptions)
          .where(
            and(eq(descriptions.id, query.id), isNull(descriptions.deletedAt)),
          )
          .limit(1);
        return Option.fromNullable(result as DescriptionContent | undefined);
      },
      catch: (error) => new Error(String(error)),
    }),

  softDelete: (command) =>
    Effect.tryPromise({
      try: async () => {
        const [deleted] = await db
          .update(descriptions)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(descriptions.id, command.id),
              eq(descriptions.channelId, command.channelId),
              isNull(descriptions.deletedAt),
            ),
          )
          .returning();

        if (!deleted) {
          throw new Error("Description not found or not owned by user");
        }

        return deleted as Description;
      },
      catch: (error) => new Error(String(error)),
    }),
});
