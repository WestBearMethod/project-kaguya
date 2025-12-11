import { Context, Effect, Layer } from "effect";
import type {
  CreateDescription,
  Description,
} from "@/domain/description/Description";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";

export class SaveDescription extends Context.Tag("SaveDescription")<
  SaveDescription,
  {
    readonly execute: (
      data: CreateDescription,
    ) => Effect.Effect<Description, Error>;
  }
>() {
  static readonly Live = Layer.effect(
    SaveDescription,
    Effect.gen(function* () {
      const repository = yield* DescriptionRepository;
      return {
        execute: (data: CreateDescription) => repository.save(data),
      };
    }),
  );
}
