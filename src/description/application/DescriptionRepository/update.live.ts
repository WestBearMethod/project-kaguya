import { Effect, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions } from "@/db/schema";
import type { IDescriptionWriter } from "@/description/application/DescriptionRepository";
import { Description } from "@/description/domain/entities";

export const makeUpdate =
  (db: DrizzleDb): IDescriptionWriter["update"] =>
  (entity) =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: async () => {
          const [saved] = await db
            .insert(descriptions)
            .values({
              id: entity.id,
              title: entity.title,
              content: entity.content,
              category: entity.category,
              channelId: entity.channelId,
              createdAt: entity.createdAt,
              deletedAt: entity.deletedAt,
            })
            .onConflictDoUpdate({
              target: descriptions.id,
              set: {
                title: entity.title,
                content: entity.content,
                category: entity.category,
                deletedAt: entity.deletedAt,
              },
            })
            .returning();

          return saved;
        },
        catch: (error) => new Error(String(error)),
      });

      return yield* Schema.decodeUnknown(Description)(result).pipe(
        Effect.mapError((error) => new Error(String(error))),
      );
    });
