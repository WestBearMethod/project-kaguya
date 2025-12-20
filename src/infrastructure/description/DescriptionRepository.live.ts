import { Effect, Layer } from "effect";
import {
  DescriptionReader,
  DescriptionWriter,
} from "@/application/description/DescriptionRepository";
import { DatabaseService } from "@/infrastructure/db/service";
import { makeFindByChannelId } from "@/infrastructure/description/DescriptionRepository/findByChannelId.live";
import { makeFindById } from "@/infrastructure/description/DescriptionRepository/findById.live";
import { makeSave } from "@/infrastructure/description/DescriptionRepository/save.live";
import { makeSoftDelete } from "@/infrastructure/description/DescriptionRepository/softDelete.live";

export const DescriptionReaderLive = Layer.effect(
  DescriptionReader,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    return {
      findByChannelId: makeFindByChannelId(db),
      findById: makeFindById(db),
    };
  }),
);

export const DescriptionWriterLive = Layer.effect(
  DescriptionWriter,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    return {
      save: makeSave(db),
      softDelete: makeSoftDelete(db),
    };
  }),
);
