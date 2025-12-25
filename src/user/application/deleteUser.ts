import { Context, Effect, Layer, Option, type ParseResult } from "effect";
import type { DeleteUserCommand } from "@/user/application/commands";
import type { DeletedUser } from "@/user/application/dtos";
import { UserWriter } from "@/user/application/UserRepository";
import { isUserDeleted, softDeleteUser } from "@/user/domain/entities";
import {
  UserAlreadyDeletedError,
  type UserDomainError,
  UserNotFoundError,
} from "@/user/domain/errors";

export class DeleteUser extends Context.Tag("DeleteUser")<
  DeleteUser,
  {
    readonly execute: (
      command: DeleteUserCommand,
    ) => Effect.Effect<
      DeletedUser,
      UserDomainError | ParseResult.ParseError | Error
    >;
  }
>() {
  static readonly Live = Layer.effect(
    DeleteUser,
    Effect.gen(function* () {
      const writer = yield* UserWriter;
      return {
        execute: (command: DeleteUserCommand) =>
          Effect.gen(function* () {
            const userOption = yield* writer.findEntityByChannelId(
              command.channelId,
            );

            const user = yield* Option.match(userOption, {
              onNone: () =>
                Effect.fail(
                  new UserNotFoundError({ channelId: command.channelId }),
                ),
              onSome: (user) => Effect.succeed(user),
            });

            if (isUserDeleted(user)) {
              return yield* Effect.fail(
                new UserAlreadyDeletedError({ channelId: command.channelId }),
              );
            }

            const updatedUser = yield* softDeleteUser(user).pipe(
              Effect.mapError((error) => new Error(String(error))),
            );

            return yield* writer.softDelete(updatedUser);
          }),
      };
    }),
  );
}
