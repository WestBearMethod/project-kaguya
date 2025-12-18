import { Context, Effect, Layer } from "effect";
import type { DeleteUserCommand } from "@/domain/user/commands";
import type { DeletedUser } from "@/domain/user/dtos";
import type { UserDomainError } from "@/domain/user/errors";
import { UserRepository } from "@/domain/user/UserRepository";

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
          repository.softDeleteWithDescriptions(command),
      };
    }),
  );
}
