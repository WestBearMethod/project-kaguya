import { type Chunk, Context, Effect, Layer } from "effect";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import type { DescriptionSummary } from "@/domain/description/dtos";
import type { GetDescriptionsQuery } from "@/domain/description/queries";

export class GetDescriptions extends Context.Tag("GetDescriptions")<
  GetDescriptions,
  {
    readonly execute: (
      query: GetDescriptionsQuery,
    ) => Effect.Effect<Chunk.Chunk<DescriptionSummary>, Error>;
  }
>() {
  static readonly Live = Layer.effect(
    GetDescriptions,
    Effect.gen(function* () {
      const repository = yield* DescriptionRepository;
      return {
        execute: (query: GetDescriptionsQuery) =>
          repository.findByChannelId(query),
      };
    }),
  );
}
