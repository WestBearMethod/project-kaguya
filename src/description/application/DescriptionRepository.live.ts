import { Effect, Layer } from "effect";
import {
  DescriptionReader,
  DescriptionWriter,
} from "@/description/application/DescriptionRepository";
import { makeCreate } from "@/description/application/DescriptionRepository/create.live";
import { makeFindByChannelId } from "@/description/application/DescriptionRepository/findByChannelId.live";
import { makeFindContentById } from "@/description/application/DescriptionRepository/findContentById.live";
import { makeFindEntityById } from "@/description/application/DescriptionRepository/findEntityById.live";
import { makeUpdate } from "@/description/application/DescriptionRepository/update.live";
import { DatabaseService } from "@/shared/infrastructure/db";

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
