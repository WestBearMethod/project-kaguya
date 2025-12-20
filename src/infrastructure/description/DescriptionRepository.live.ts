import { Effect, Layer } from "effect";
import {
  DescriptionReader,
  DescriptionWriter,
} from "@/application/description/DescriptionRepository";
import { DatabaseService } from "@/infrastructure/db/service";
import { makeCreate } from "@/infrastructure/description/DescriptionRepository/create.live";
import { makeFindByChannelId } from "@/infrastructure/description/DescriptionRepository/findByChannelId.live";
import { makeFindContentById } from "@/infrastructure/description/DescriptionRepository/findContentById.live";
import { makeFindEntityById } from "@/infrastructure/description/DescriptionRepository/findEntityById.live";
import { makeUpdate } from "@/infrastructure/description/DescriptionRepository/update.live";

export const DescriptionReaderLive = Layer.effect(
  DescriptionReader,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    return {
      findByChannelId: makeFindByChannelId(db),
      findContentById: makeFindContentById(db),
    };
  }),
);

export const DescriptionWriterLive = Layer.effect(
  DescriptionWriter,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    const update = makeUpdate(db);
    return {
      create: makeCreate(db),
      update,
      softDelete: update,
      findEntityById: makeFindEntityById(db),
    };
  }),
);
