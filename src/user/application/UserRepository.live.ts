import { Effect, Layer } from "effect";
import { DatabaseService } from "@/infrastructure/db/service";
import { UserReader, UserWriter } from "@/user/application/UserRepository";
import { makeFindByChannelId } from "@/user/application/UserRepository/findByChannelId.live";
import { makeFindEntityByChannelId } from "@/user/application/UserRepository/findEntityByChannelId.live";
import { makeSoftDelete } from "@/user/application/UserRepository/softDelete.live";

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
      findEntityByChannelId: makeFindEntityByChannelId(db),
      softDelete: makeSoftDelete(db),
    };
  }),
);
