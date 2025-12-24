import { Context, Effect, Layer, Option } from "effect";
import type { DeleteDescriptionCommand } from "@/description/application/commands";
import { DescriptionWriter } from "@/description/application/DescriptionRepository";
import type { Description } from "@/description/domain/entities";
import {
  DescriptionAlreadyDeletedError,
  type DescriptionDomainError,
  DescriptionNotFoundError,
  PermissionDeniedError,
} from "@/description/domain/errors";

export class DeleteDescription extends Context.Tag("DeleteDescription")<
  DeleteDescription,
  {
    readonly execute: (
      command: DeleteDescriptionCommand,
    ) => Effect.Effect<Description, DescriptionDomainError | Error>;
  }
>() {
  static readonly Live = Layer.effect(
    DeleteDescription,
    Effect.gen(function* () {
      const repository = yield* DescriptionWriter;
      return {
        execute: (command: DeleteDescriptionCommand) =>
          Effect.gen(function* () {
            // 1. Fetch current state
            const descriptionOption = yield* repository.findEntityById(
              command.id,
            );

            const description = yield* Option.match(descriptionOption, {
              onNone: () =>
                Effect.fail(new DescriptionNotFoundError({ id: command.id })),
              onSome: (description) => Effect.succeed(description),
            });

            // 2. Business Rule Validation
            if (description.channelId !== command.channelId) {
              return yield* Effect.fail(
                new PermissionDeniedError({
                  id: command.id,
                  reason: "Channel ID mismatch",
                }),
              );
            }

            if (description.deletedAt !== null) {
              return yield* Effect.fail(
                new DescriptionAlreadyDeletedError({ id: command.id }),
              );
            }

            // 3. State Transition in Memory
            const deletedDescription: Description = {
              ...description,
              deletedAt: new Date(),
            };

            // 4. Persistence
            return yield* repository.softDelete(deletedDescription);
          }),
      };
    }),
  );
}
