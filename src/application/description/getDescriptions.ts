import { Context, Effect, Layer } from "effect";
import {
  DescriptionRepository,
  type GetDescriptionsQuery,
} from "@/domain/description/DescriptionRepository";
import type { DescriptionSummary } from "@/domain/description/dtos";

export class GetDescriptions extends Context.Tag("GetDescriptions")<
  GetDescriptions,
  {
    readonly execute: (
      query: GetDescriptionsQuery,
    ) => Effect.Effect<DescriptionSummary[], Error>;
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
