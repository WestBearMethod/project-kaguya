import { eq } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { users } from "@/db/schema";
import type { ChannelId } from "@/shared/domain/valueObjects";
import type { IUserWriter } from "@/user/application/UserRepository";
import { User } from "@/user/domain/entities";

export const makeFindEntityByChannelId =
  (db: DrizzleDb): IUserWriter["findEntityByChannelId"] =>
  (channelId: typeof ChannelId.Type) =>
    Effect.gen(function* () {
      const maybeResult = yield* Effect.tryPromise({
        try: async () => {
          const [result] = await db
            .select()
            .from(users)
            .where(eq(users.channelId, channelId))
            .limit(1);
          return Option.fromNullable(result);
        },
        catch: (error) => new Error(String(error)),
      });

      if (Option.isNone(maybeResult)) {
        return Option.none();
      }

      const entity = yield* Schema.decodeUnknown(User)(maybeResult.value).pipe(
        Effect.mapError((error) => new Error(String(error))),
      );

      return Option.some(entity);
    });
