import { Context, Effect, Layer } from "effect";
import type { Description } from "@/domain/description/Description";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";

export class GetDescriptions extends Context.Tag("GetDescriptions")<
  GetDescriptions,
  {
    readonly execute: (
      channelId: string,
    ) => Effect.Effect<Description[], Error>;
  }
>() {
  static readonly Live = Layer.effect(
    GetDescriptions,
    Effect.gen(function* () {
      const repository = yield* DescriptionRepository;
      return {
        execute: (channelId: string) => repository.findByChannelId(channelId),
      };
    }),
  );
}
