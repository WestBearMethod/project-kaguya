import { Context, Effect, Layer } from "effect";
import type { DeleteDescriptionCommand } from "@/application/description/commands";
import { DescriptionWriter } from "@/application/description/DescriptionRepository";
import type { Description } from "@/domain/description/entities";

export class DeleteDescription extends Context.Tag("DeleteDescription")<
  DeleteDescription,
  {
    readonly execute: (
      command: DeleteDescriptionCommand,
    ) => Effect.Effect<Description, Error>;
  }
>() {
  static readonly Live = Layer.effect(
    DeleteDescription,
    Effect.gen(function* () {
      const repository = yield* DescriptionWriter;
      return {
        execute: (command: DeleteDescriptionCommand) =>
          repository.softDelete(command),
      };
    }),
  );
}
