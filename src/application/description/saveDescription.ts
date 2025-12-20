import { Context, Effect, Layer, Schema } from "effect";
import type { CreateDescriptionCommand } from "@/application/description/commands";
import { DescriptionWriter } from "@/application/description/DescriptionRepository";
import {
  type Description,
  DescriptionDraft,
} from "@/domain/description/entities";

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
          Effect.gen(function* () {
            // Memory-level Validation & Construction of the Draft
            // Identity (ID) and timestamps will be assigned by the DB
            const draft = yield* Schema.decodeUnknown(DescriptionDraft)({
              ...command,
              category: command.category ?? null,
            }).pipe(Effect.mapError((error) => new Error(String(error))));

            return yield* repository.create(draft);
          }),
      };
    }),
  );
}
