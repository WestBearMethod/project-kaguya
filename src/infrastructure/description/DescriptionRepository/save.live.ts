import { Effect, Schema } from "effect";
import { db } from "@/db";
import { descriptions, users } from "@/db/schema";
import type { IDescriptionRepository } from "@/domain/description/DescriptionRepository";
import { Description } from "@/domain/description/entities";

export const save: IDescriptionRepository["save"] = (command) =>
  Effect.gen(function* () {
    const result = yield* Effect.tryPromise({
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
    });

    return yield* Schema.decodeUnknown(Description)(result).pipe(
      Effect.mapError((error) => new Error(String(error))),
    );
  });
