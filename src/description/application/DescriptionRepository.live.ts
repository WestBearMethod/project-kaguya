import { Effect, Layer } from "effect";
import {
  DescriptionReader,
  DescriptionWriter,
} from "@/description/application/DescriptionRepository";
import { makeCreate } from "@/description/application/DescriptionRepository/create.live";
import { makeFindByChannelId } from "@/description/application/DescriptionRepository/findByChannelId.live";
import { makeFindContentById } from "@/description/application/DescriptionRepository/findContentById.live";
import { makeFindEntityById } from "@/description/application/DescriptionRepository/findEntityById.live";
import { makeSoftDelete } from "@/description/application/DescriptionRepository/softDelete.live";
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
    return {
      create: makeCreate(db),
      update: makeUpdate(db),
      softDelete: makeSoftDelete(db),
      findEntityById: makeFindEntityById(db),
    };
  }),
);
