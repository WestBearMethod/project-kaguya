import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { db } from "@/db";
import { descriptions } from "@/db/schema";
import type { IDescriptionRepository } from "@/domain/description/DescriptionRepository";
import { Description } from "@/domain/description/entities";

export const softDelete: IDescriptionRepository["softDelete"] = (command) =>
  Effect.gen(function* () {
    const result = yield* Effect.tryPromise({
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
    });

    return yield* Schema.decodeUnknown(Description)(result).pipe(
      Effect.catchAll((error) => Effect.fail(new Error(String(error)))),
    );
  });
