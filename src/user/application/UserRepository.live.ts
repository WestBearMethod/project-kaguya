import { Effect, Layer } from "effect";
import { DrizzleService } from "@/shared/infrastructure/db/DrizzleService";
import { UserReader, UserWriter } from "@/user/application/UserRepository";
import { makeFindByChannelId } from "@/user/application/UserRepository/findByChannelId.live";
import { makeFindEntityByChannelId } from "@/user/application/UserRepository/findEntityByChannelId.live";
import { makeSoftDelete } from "@/user/application/UserRepository/softDelete.live";

export const UserReaderLive = Layer.effect(
  UserReader,
  Effect.gen(function* () {
    const service = yield* DrizzleService;
    return {
      findByChannelId: makeFindByChannelId(service),
    };
  }),
);

export const UserWriterLive = Layer.effect(
  UserWriter,
  Effect.gen(function* () {
    const service = yield* DrizzleService;
    return {
      findEntityByChannelId: makeFindEntityByChannelId(service),
      softDelete: makeSoftDelete(service),
    };
  }),
);
