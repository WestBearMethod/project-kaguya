import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions, users } from "@/db/schema";
import { DeletedUser } from "@/user/application/dtos";
import type { IUserWriter } from "@/user/application/UserRepository";
import type { User } from "@/user/domain/entities";

export const makeSoftDelete =
  (db: DrizzleDb): IUserWriter["softDelete"] =>
  (user: User) =>
    Effect.gen(function* () {
      const deletedAt = user.deletedAt ?? new Date();

      const deletedUser = yield* Effect.tryPromise({
        try: async () => {
          return await db.transaction(async (tx) => {
            const [result] = await tx
              .update(users)
              .set({ deletedAt })
              .where(and(eq(users.id, user.id), isNull(users.deletedAt)))
              .returning();

            if (!result) {
              throw new Error(
                "User record not updated (possibly already deleted or not found)",
              );
            }

            await tx
              .update(descriptions)
              .set({ deletedAt })
              .where(
                and(
                  eq(descriptions.channelId, user.channelId),
                  isNull(descriptions.deletedAt),
                ),
              );

            return result;
          });
        },
        catch: (error) => new Error(String(error)),
      });

      return yield* Schema.decodeUnknown(DeletedUser)(deletedUser);
    });
