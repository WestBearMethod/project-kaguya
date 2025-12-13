import { Context, Effect, Layer } from "effect";
import type { Description } from "@/domain/description/Description";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";

export class DeleteDescription extends Context.Tag("DeleteDescription")<
  DeleteDescription,
  {
    readonly execute: (
      id: string,
      channelId: string,
    ) => Effect.Effect<Description, Error>;
  }
>() {
  static readonly Live = Layer.effect(
    DeleteDescription,
    Effect.gen(function* () {
      const repository = yield* DescriptionRepository;
      return {
        execute: (id: string, channelId: string) =>
          repository.softDelete(id, channelId),
      };
    }),
  );
}
