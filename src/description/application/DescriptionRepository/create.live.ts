import { Effect, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions, users } from "@/db/schema";
import type { IDescriptionWriter } from "@/description/application/DescriptionRepository";
import { Description } from "@/description/domain/entities";

export const makeCreate =
  (db: DrizzleDb): IDescriptionWriter["create"] =>
  (draft) =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: async () => {
          // Ensure user exists
          await db
            .insert(users)
            .values({ channelId: draft.channelId })
            .onConflictDoNothing({ target: users.channelId });

          const [saved] = await db
            .insert(descriptions)
            .values({
              title: draft.title,
              content: draft.content,
              category: draft.category,
              channelId: draft.channelId,
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
