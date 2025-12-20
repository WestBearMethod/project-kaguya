import { eq } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import type { IDescriptionWriter } from "@/application/description/DescriptionRepository";
import type { DrizzleDb } from "@/db";
import { descriptions } from "@/db/schema";
import { Description } from "@/domain/description/entities";
import type { DescriptionId } from "@/domain/description/valueObjects";

export const makeFindEntityById =
  (db: DrizzleDb): IDescriptionWriter["findEntityById"] =>
  (id: typeof DescriptionId.Type) =>
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
