import { eq } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import { users } from "@/db/schema";
import type { IDrizzleService } from "@/shared/infrastructure/db/DrizzleService";
import { UserFound } from "@/user/application/dtos";
import type { IUserReader } from "@/user/application/UserRepository";

export const makeFindByChannelId =
  (service: IDrizzleService): IUserReader["findByChannelId"] =>
  (query) =>
    Effect.gen(function* () {
      const user = yield* service.run(async (db) => {
        const [result] = await db
          .select({
            id: users.id,
            channelId: users.channelId,
            deletedAt: users.deletedAt,
          })
          .from(users)
          .where(eq(users.channelId, query.channelId))
          .limit(1);

        return result;
      });

      if (!user) {
        return Option.none();
      }

      return Option.some(yield* Schema.decodeUnknown(UserFound)(user));
    });
