import { and, eq, isNull } from "drizzle-orm";
import { Effect, Option } from "effect";
import type { DrizzleDb } from "@/db";
import { users } from "@/db/schema";
import type { IUserRepository } from "@/domain/user/UserRepository";

export const makeFindByChannelId =
  (db: DrizzleDb): IUserRepository["findByChannelId"] =>
  (query) =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: async () => {
          const [user] = await db
            .select({ id: users.id, channelId: users.channelId })
            .from(users)
            .where(
              and(
                eq(users.channelId, query.channelId),
                isNull(users.deletedAt),
              ),
            )
            .limit(1);

          return user;
        },
        catch: (error) => new Error(String(error)),
      });

      return result ? Option.some(result) : Option.none();
    });
