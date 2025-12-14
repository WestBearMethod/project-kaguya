import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import { Effect, Layer, Option, Schema } from "effect";
import { db } from "@/db";
import { descriptions, users } from "@/db/schema";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import {
  DescriptionContent,
  PaginatedDescriptionSummary,
} from "@/domain/description/dtos";
import { Description } from "@/domain/description/entities";
import { PAGINATION_LIMIT } from "@/domain/description/valueObjects";

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
            category: command.category,
            channelId: command.channelId,
          })
          .returning();

        return saved;
      },
      catch: (error) => new Error(String(error)),
    }).pipe(
      Effect.flatMap(Schema.decodeUnknown(Description)),
      Effect.catchAll((error) => Effect.fail(new Error(String(error)))),
    ),

  findByChannelId: (query) =>
    Effect.tryPromise({
      try: async () => {
        const limit = PAGINATION_LIMIT;

        const [cursorTime, cursorId] = query.cursor
          ? (() => {
              try {
                const decoded = Buffer.from(query.cursor, "base64").toString(
                  "utf-8",
                );
                const [timeStr, idStr] = decoded.split("_");

                if (!timeStr || !idStr) {
                  return [Option.none(), Option.none()] as const;
                }

                const date = new Date(timeStr);
                if (Number.isNaN(date.getTime())) {
                  console.warn(`Invalid date format in cursor: ${timeStr}`);
                  return [Option.none(), Option.none()] as const;
                }

                return [Option.some(date), Option.some(idStr)] as const;
              } catch (e) {
                console.warn("Invalid cursor format", e);
                return [Option.none(), Option.none()] as const;
              }
            })()
          : ([Option.none(), Option.none()] as const);

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
                const cursorValue = `${lastItem.createdAt.toISOString()}_${lastItem.id}`;
                return [
                  items,
                  Option.some(Buffer.from(cursorValue).toString("base64")),
                ] as const;
              })()
            : ([results, Option.none<string>()] as const);

        return {
          items,
          nextCursor: Option.getOrNull(nextCursor),
        };
      },
      catch: (error) => new Error(String(error)),
    }).pipe(
      Effect.flatMap((result) =>
        Schema.decodeUnknown(PaginatedDescriptionSummary)(result),
      ),
      Effect.catchAll((error) => Effect.fail(new Error(String(error)))),
    ),

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
        return Option.fromNullable(result);
      },
      catch: (error) => new Error(String(error)),
    }).pipe(
      Effect.flatMap((option) =>
        Option.match(option, {
          onNone: () => Effect.succeed(Option.none()),
          onSome: (content) =>
            Effect.map(
              Schema.decodeUnknown(DescriptionContent)(content),
              Option.some,
            ),
        }),
      ),
      Effect.catchAll((error) => Effect.fail(new Error(String(error)))),
    ),

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

        return deleted;
      },
      catch: (error) => new Error(String(error)),
    }).pipe(
      Effect.flatMap(Schema.decodeUnknown(Description)),
      Effect.catchAll((error) => Effect.fail(new Error(String(error)))),
    ),
});
