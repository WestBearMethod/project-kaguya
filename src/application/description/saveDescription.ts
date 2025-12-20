import { Context, Effect, Layer } from "effect";
import type { CreateDescriptionCommand } from "@/application/description/commands";
import { DescriptionWriter } from "@/application/description/DescriptionRepository";
import type { Description } from "@/domain/description/entities";

export class SaveDescription extends Context.Tag("SaveDescription")<
  SaveDescription,
  {
    readonly execute: (
      command: CreateDescriptionCommand,
    ) => Effect.Effect<Description, Error>;
  }
>() {
  static readonly Live = Layer.effect(
    SaveDescription,
    Effect.gen(function* () {
      const repository = yield* DescriptionWriter;
      return {
        execute: (command: CreateDescriptionCommand) =>
          repository.save(command),
      };
    }),
  );
}
