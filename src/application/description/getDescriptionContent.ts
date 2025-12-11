import { Context, Effect, Layer } from "effect";
import type { DescriptionContent } from "@/domain/description/Description";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";

export class GetDescriptionContent extends Context.Tag("GetDescriptionContent")<
  GetDescriptionContent,
  {
    readonly execute: (
      id: string,
    ) => Effect.Effect<DescriptionContent | null, Error>;
  }
>() {
  static readonly Live = Layer.effect(
    GetDescriptionContent,
    Effect.gen(function* () {
      const repository = yield* DescriptionRepository;
      return {
        execute: (id: string) => repository.findById(id),
      };
    }),
  );
}
