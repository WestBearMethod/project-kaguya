import { Context, Effect, Layer, Option, Schema } from "effect";
import type { DeleteUserCommand } from "@/application/user/commands";
import type { DeletedUser } from "@/application/user/dtos";
import { GetUserByChannelIdQuery } from "@/application/user/queries";
import { UserRepository } from "@/application/user/UserRepository";
import { isUserDeleted } from "@/domain/user/entities";
import {
  UserAlreadyDeletedError,
  type UserDomainError,
  UserNotFoundError,
} from "@/domain/user/errors";

export class DeleteUser extends Context.Tag("DeleteUser")<
  DeleteUser,
  {
    readonly execute: (
      command: DeleteUserCommand,
    ) => Effect.Effect<DeletedUser, UserDomainError | Error>;
  }
>() {
  static readonly Live = Layer.effect(
    DeleteUser,
    Effect.gen(function* () {
      const repository = yield* UserRepository;
      return {
        execute: (command: DeleteUserCommand) =>
          Effect.gen(function* () {
            const query = yield* Schema.decodeUnknown(GetUserByChannelIdQuery)(
              command,
            );
            const userOption = yield* repository.findByChannelId(query);

            const user = yield* Option.match(userOption, {
              onNone: () =>
                Effect.fail(
                  new UserNotFoundError({ channelId: query.channelId }),
                ),
              onSome: (user) => Effect.succeed(user),
            });

            if (isUserDeleted(user)) {
              return yield* Effect.fail(
                new UserAlreadyDeletedError({ channelId: query.channelId }),
              );
            }

            return yield* repository.softDeleteWithDescriptions(command);
          }),
      };
    }),
  );
}
