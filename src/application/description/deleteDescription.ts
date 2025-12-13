import { Context, Effect, Layer } from "effect";
import type { Description } from "@/domain/description/Description";
import {
  type DeleteDescriptionCommand,
  DescriptionRepository,
} from "@/domain/description/DescriptionRepository";

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
      const repository = yield* DescriptionRepository;
      return {
        execute: (command: DeleteDescriptionCommand) =>
          repository.softDelete(command),
      };
    }),
  );
}
