import { and, eq, isNull } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import { db } from "@/db";
import { descriptions } from "@/db/schema";
import type { IDescriptionRepository } from "@/domain/description/DescriptionRepository";
import { DescriptionContent } from "@/domain/description/dtos";

export const findById: IDescriptionRepository["findById"] = (query) =>
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
  );
