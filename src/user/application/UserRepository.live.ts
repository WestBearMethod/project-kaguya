import { Effect, Layer } from "effect";
import { DatabaseService } from "@/infrastructure/db/service";
import { UserReader, UserWriter } from "@/user/application/UserRepository";
import { makeFindByChannelId } from "@/user/application/UserRepository/findByChannelId.live";
import { makeSoftDeleteWithDescriptions } from "@/user/application/UserRepository/softDeleteWithDescriptions.live";

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
