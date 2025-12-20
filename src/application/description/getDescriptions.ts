import { Context, Effect, Layer } from "effect";
import { DescriptionRepository } from "@/application/description/DescriptionRepository";
import type { PaginatedDescriptionSummary } from "@/application/description/dtos";
import type { GetDescriptionsQuery } from "@/application/description/queries";

export class GetDescriptions extends Context.Tag("GetDescriptions")<
  GetDescriptions,
  {
    readonly execute: (
      query: GetDescriptionsQuery,
    ) => Effect.Effect<PaginatedDescriptionSummary, Error>;
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
