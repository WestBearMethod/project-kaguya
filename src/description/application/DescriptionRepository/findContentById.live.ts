import { and, eq, isNull } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions } from "@/db/schema";
import type { IDescriptionReader } from "@/description/application/DescriptionRepository";
import { DescriptionContent } from "@/description/application/dtos";

export const makeFindContentById =
  (db: DrizzleDb): IDescriptionReader["findContentById"] =>
  (query) =>
    Effect.gen(function* () {
      const maybeResult = yield* Effect.tryPromise({
        try: async () => {
          const [result] = await db
            .select({
              content: descriptions.content,
            })
            .from(descriptions)
            .where(
              and(
                eq(descriptions.id, query.id),
                isNull(descriptions.deletedAt),
              ),
            )
            .limit(1);
          return Option.fromNullable(result);
        },
        catch: (error) => new Error(String(error)),
      });

      if (Option.isNone(maybeResult)) {
        return Option.none();
      }

      const content = yield* Schema.decodeUnknown(DescriptionContent)(
        maybeResult.value,
      ).pipe(Effect.mapError((error) => new Error(String(error))));

      return Option.some(content);
    });
