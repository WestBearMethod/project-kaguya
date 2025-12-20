import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions } from "@/db/schema";
import type { IDescriptionReader } from "@/description/application/DescriptionRepository";
import { PaginatedDescriptionSummary } from "@/description/application/dtos";
import { PAGINATION_LIMIT } from "@/description/domain/valueObjects";
import { decodeCursor, encodeCursor } from "@/description/infrastructure/utils";

export const makeFindByChannelId =
  (db: DrizzleDb): IDescriptionReader["findByChannelId"] =>
  (query) =>
    Effect.gen(function* () {
      const [cursorTime, cursorId] = yield* decodeCursor(query.cursor);

      const result = yield* Effect.tryPromise({
        try: async () => {
          const limit = PAGINATION_LIMIT;

          const results = await db
            .select({
              id: descriptions.id,
              title: descriptions.title,
              category: descriptions.category,
              createdAt: descriptions.createdAt,
            })
            .from(descriptions)
            .where(
              and(
                eq(descriptions.channelId, query.channelId),
                isNull(descriptions.deletedAt),
                query.category === null
                  ? isNull(descriptions.category)
                  : query.category
                    ? eq(descriptions.category, query.category)
                    : undefined,
                Option.isSome(cursorTime) && Option.isSome(cursorId)
                  ? or(
                      lt(descriptions.createdAt, cursorTime.value),
                      and(
                        eq(descriptions.createdAt, cursorTime.value),
                        lt(descriptions.id, cursorId.value),
                      ),
                    )
                  : undefined,
              ),
            )
            .orderBy(desc(descriptions.createdAt), desc(descriptions.id))
            .limit(limit + 1);

          const [items, nextCursor] =
            results.length > limit
              ? (() => {
                  const items = results.slice(0, limit);
                  const lastItem = items[items.length - 1];
                  return [items, Option.some(encodeCursor(lastItem))] as const;
                })()
              : ([results, Option.none<string>()] as const);

          return {
            items,
            nextCursor: Option.getOrNull(nextCursor),
          };
        },
        catch: (error) => new Error(String(error)),
      });

      return yield* Schema.decodeUnknown(PaginatedDescriptionSummary)(
        result,
      ).pipe(Effect.mapError((error) => new Error(String(error))));
    });
