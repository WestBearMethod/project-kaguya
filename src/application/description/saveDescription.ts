import { Context, Effect, Layer } from "effect";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import type { CreateDescriptionCommand } from "@/domain/description/dtos";
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
      const repository = yield* DescriptionRepository;
      return {
        execute: (command: CreateDescriptionCommand) =>
          repository.save(command),
      };
    }),
  );
}
