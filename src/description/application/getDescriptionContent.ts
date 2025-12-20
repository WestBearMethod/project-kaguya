import { Context, Effect, Layer, type Option } from "effect";
import { DescriptionReader } from "@/description/application/DescriptionRepository";
import type { DescriptionContent } from "@/description/application/dtos";
import type { GetDescriptionContentQuery } from "@/description/application/queries";

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
      return { execute: (query) => repository.findContentById(query) };
    }),
  );
}
