import { and, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import type { DrizzleDb } from "@/db";
import { descriptions, users } from "@/db/schema";
import { DeletedUser } from "@/domain/user/dtos";
import {
  UserAlreadyDeletedError,
  UserNotFoundError,
} from "@/domain/user/errors";
import type { IUserRepository } from "@/domain/user/UserRepository";

export const makeSoftDeleteWithDescriptions =
  (db: DrizzleDb): IUserRepository["softDeleteWithDescriptions"] =>
  (command) =>
    Effect.gen(function* () {
      const deletedUser = yield* Effect.tryPromise({
        try: async () => {
          return await db.transaction(async (tx) => {
            const now = new Date();

            // 存在確認と状態チェック
            const [existing] = await tx
              .select()
              .from(users)
              .where(eq(users.channelId, command.channelId))
              .limit(1);

            if (!existing) {
              throw new UserNotFoundError({ channelId: command.channelId });
            }

            if (existing.deletedAt) {
              throw new UserAlreadyDeletedError({
                channelId: command.channelId,
              });
            }

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

            // result がないケースは、上記のチェックにより基本的には発生しないはずだが念のため
            if (!result) {
              throw new Error("Failed to update user deletedAt");
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
          if (
            error instanceof UserNotFoundError ||
            error instanceof UserAlreadyDeletedError
          ) {
            return error;
          }
          return new Error(String(error));
        },
      });

      return yield* Schema.decodeUnknown(DeletedUser)(deletedUser);
    });
