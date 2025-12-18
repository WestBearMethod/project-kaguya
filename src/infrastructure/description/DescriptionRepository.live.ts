import { Effect, Layer } from "effect";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import { DatabaseService } from "@/infrastructure/db/service";
import { makeFindByChannelId } from "@/infrastructure/description/DescriptionRepository/findByChannelId.live";
import { makeFindById } from "@/infrastructure/description/DescriptionRepository/findById.live";
import { makeSave } from "@/infrastructure/description/DescriptionRepository/save.live";
import { makeSoftDelete } from "@/infrastructure/description/DescriptionRepository/softDelete.live";

export const DescriptionRepositoryLive = Layer.effect(
  DescriptionRepository,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    return {
      save: makeSave(db),
      findByChannelId: makeFindByChannelId(db),
      findById: makeFindById(db),
      softDelete: makeSoftDelete(db),
    };
  }),
);
