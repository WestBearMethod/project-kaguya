import { Context, Effect, Layer } from "effect";
import type { DescriptionContent } from "@/domain/description/Description";
import {
  DescriptionRepository,
  type GetDescriptionContentQuery,
} from "@/domain/description/DescriptionRepository";

export class GetDescriptionContent extends Context.Tag("GetDescriptionContent")<
  GetDescriptionContent,
  {
    readonly execute: (
      query: GetDescriptionContentQuery,
    ) => Effect.Effect<DescriptionContent | null, Error>;
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
