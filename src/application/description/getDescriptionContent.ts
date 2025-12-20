import { Context, Effect, Layer, type Option } from "effect";
import { DescriptionReader } from "@/application/description/DescriptionRepository";
import type { DescriptionContent } from "@/application/description/dtos";
import type { GetDescriptionContentQuery } from "@/application/description/queries";

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
      const repository = yield* DescriptionReader;
      return { execute: (query) => repository.findById(query) };
    }),
  );
}
