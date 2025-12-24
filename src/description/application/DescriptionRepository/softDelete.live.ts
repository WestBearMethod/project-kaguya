import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions } from "@/db/schema";
import type { IDescriptionWriter } from "@/description/application/DescriptionRepository";
import { Description } from "@/description/domain/entities";

export const makeSoftDelete =
  (db: DrizzleDb): IDescriptionWriter["softDelete"] =>
  (entity) =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: async () => {
          const [deleted] = await db
            .update(descriptions)
            .set({ deletedAt: entity.deletedAt })
            .where(
              and(
                eq(descriptions.id, entity.id),
                isNull(descriptions.deletedAt),
              ),
            )
            .returning();

          if (!deleted) {
            throw new Error(
              `Description with id ${entity.id} not found or already deleted for soft delete.`,
            );
          }

          return deleted;
        },
        catch: (error) => new Error(String(error)),
      });

      return yield* Schema.decodeUnknown(Description)(result).pipe(
        Effect.mapError((error) => new Error(String(error))),
      );
    });
