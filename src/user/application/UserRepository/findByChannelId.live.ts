import { eq } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { users } from "@/db/schema";
import { UserFound } from "@/user/application/dtos";
import type { IUserReader } from "@/user/application/UserRepository";

export const makeFindByChannelId =
  (db: DrizzleDb): IUserReader["findByChannelId"] =>
  (query) =>
    Effect.gen(function* () {
      const user = yield* Effect.tryPromise({
        try: async () => {
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
        },
        catch: (error) => new Error(String(error)),
      });

      if (!user) {
        return Option.none();
      }

      return Option.some(yield* Schema.decodeUnknown(UserFound)(user));
    });
