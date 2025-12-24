import { Context, Effect, Layer } from "effect";
import { DescriptionReader } from "@/description/application/DescriptionRepository";
import type { PaginatedDescriptionSummary } from "@/description/application/dtos";
import type { GetDescriptionsQuery } from "@/description/application/queries";

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
      const repository = yield* DescriptionReader;
      return {
        execute: (query: GetDescriptionsQuery) =>
          repository.findByChannelId(query),
      };
    }),
  );
}
