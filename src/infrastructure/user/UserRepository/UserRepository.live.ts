import { Effect, Layer } from "effect";
import { UserReader, UserWriter } from "@/application/user/UserRepository";
import { DatabaseService } from "@/infrastructure/db/service";
import { makeFindByChannelId } from "@/infrastructure/user/UserRepository/findByChannelId.live";
import { makeSoftDeleteWithDescriptions } from "@/infrastructure/user/UserRepository/softDeleteWithDescriptions.live";

export const UserReaderLive = Layer.effect(
  UserReader,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    return {
      findByChannelId: makeFindByChannelId(db),
    };
  }),
);

export const UserWriterLive = Layer.effect(
  UserWriter,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    return {
      softDeleteWithDescriptions: makeSoftDeleteWithDescriptions(db),
    };
  }),
);
