import { and, eq, isNull } from "drizzle-orm";
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
            .update(descriptions)
            .set({
              title: entity.title,
              content: entity.content,
              category: entity.category,
            })
            .where(
              and(
                eq(descriptions.id, entity.id),
                isNull(descriptions.deletedAt),
              ),
            )
            .returning();

          if (!saved) {
            throw new Error(
              `Description with id ${entity.id} not found for update.`,
            );
          }

          return saved;
        },
        catch: (error) => new Error(String(error)),
      });

      return yield* Schema.decodeUnknown(Description)(result).pipe(
        Effect.mapError((error) => new Error(String(error))),
      );
    });
