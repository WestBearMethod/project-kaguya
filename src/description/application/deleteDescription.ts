import { Context, Effect, Layer, Option, type ParseResult } from "effect";
import type { DeleteDescriptionCommand } from "@/description/application/commands";
import { DescriptionWriter } from "@/description/application/DescriptionRepository";
import {
  type Description,
  softDeleteDescription,
} from "@/description/domain/entities";
import {
  type DescriptionDomainError,
  DescriptionNotFoundError,
} from "@/description/domain/errors";

export class DeleteDescription extends Context.Tag("DeleteDescription")<
  DeleteDescription,
  {
    readonly execute: (
      command: DeleteDescriptionCommand,
    ) => Effect.Effect<
      Description,
      DescriptionDomainError | ParseResult.ParseError | Error
    >;
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

            // 2. Business Rule Validation & State Transition in Memory
            const deletedDescription = yield* softDeleteDescription(
              description,
              command.channelId,
            );

            // 3. Persistence
            return yield* repository.softDelete(deletedDescription);
          }),
      };
    }),
  );
}
