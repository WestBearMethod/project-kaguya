import { eq } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions } from "@/db/schema";
import type { IDescriptionWriter } from "@/description/application/DescriptionRepository";
import { Description } from "@/description/domain/entities";
import type { DescriptionId } from "@/description/domain/valueObjects";

export const makeFindEntityById =
  (db: DrizzleDb): IDescriptionWriter["findEntityById"] =>
  (id: DescriptionId) =>
    Effect.gen(function* () {
      const maybeResult = yield* Effect.tryPromise({
        try: async () => {
          const [result] = await db
            .select()
            .from(descriptions)
            .where(eq(descriptions.id, id))
            .limit(1);
          return Option.fromNullable(result);
        },
        catch: (error) => new Error(String(error)),
      });

      if (Option.isNone(maybeResult)) {
        return Option.none();
      }

      const entity = yield* Schema.decodeUnknown(Description)(
        maybeResult.value,
      ).pipe(Effect.mapError((error) => new Error(String(error))));

      return Option.some(entity);
    });
