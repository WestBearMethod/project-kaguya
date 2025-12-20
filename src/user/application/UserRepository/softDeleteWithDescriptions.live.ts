import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions, users } from "@/db/schema";
import { DeletedUser } from "@/user/application/dtos";
import type { IUserWriter } from "@/user/application/UserRepository";

export const makeSoftDeleteWithDescriptions =
  (db: DrizzleDb): IUserWriter["softDeleteWithDescriptions"] =>
  (command) =>
    Effect.gen(function* () {
      const deletedUser = yield* Effect.tryPromise({
        try: async () => {
          return await db.transaction(async (tx) => {
            const now = new Date();

            // 1. ユーザーを論理削除
            const [result] = await tx
              .update(users)
              .set({ deletedAt: now })
              .where(
                and(
                  eq(users.channelId, command.channelId),
                  isNull(users.deletedAt),
                ),
              )
              .returning({
                channelId: users.channelId,
                deletedAt: users.deletedAt,
              });

            if (!result) {
              throw new Error(
                "User record not updated (possibly already deleted or not found)",
              );
            }

            // 2. ユーザーの全ての description を論理削除
            await tx
              .update(descriptions)
              .set({ deletedAt: now })
              .where(
                and(
                  eq(descriptions.channelId, command.channelId),
                  isNull(descriptions.deletedAt),
                ),
              );

            return result;
          });
        },
        catch: (error) => {
          return new Error(String(error));
        },
      });

      return yield* Schema.decodeUnknown(DeletedUser)(deletedUser);
    });
