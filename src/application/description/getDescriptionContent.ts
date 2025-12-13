import { Context, Effect, Layer, type Option } from "effect";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import type { DescriptionContent } from "@/domain/description/dtos";
import type { GetDescriptionContentQuery } from "@/domain/description/queries";

export class GetDescriptionContent extends Context.Tag("GetDescriptionContent")<
  GetDescriptionContent,
  {
    readonly execute: (
      query: GetDescriptionContentQuery,
    ) => Effect.Effect<Option.Option<DescriptionContent>, Error>;
  }
>() {
  static readonly Live = Layer.effect(
    GetDescriptionContent,
    Effect.gen(function* () {
      const repository = yield* DescriptionRepository;
      return { execute: (query) => repository.findById(query) };
    }),
  );
}
