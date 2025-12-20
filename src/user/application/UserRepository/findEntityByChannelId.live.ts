import { eq } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import { users } from "@/db/schema";
import type { ChannelId } from "@/shared/domain/valueObjects";
import type { IDrizzleService } from "@/shared/infrastructure/db/DrizzleService";
import type { IUserWriter } from "@/user/application/UserRepository";
import { User } from "@/user/domain/entities";

export const makeFindEntityByChannelId =
  (service: IDrizzleService): IUserWriter["findEntityByChannelId"] =>
  (channelId: typeof ChannelId.Type) =>
    Effect.gen(function* () {
      const maybeResult = yield* service.run(async (db) => {
        const [result] = await db
          .select()
          .from(users)
          .where(eq(users.channelId, channelId))
          .limit(1);
        return Option.fromNullable(result);
      });

      if (Option.isNone(maybeResult)) {
        return Option.none();
      }

      const entity = yield* Schema.decodeUnknown(User)(maybeResult.value).pipe(
        Effect.mapError((error) => new Error(String(error))),
      );

      return Option.some(entity);
    });
