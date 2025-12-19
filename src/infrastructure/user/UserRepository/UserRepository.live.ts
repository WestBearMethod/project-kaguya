import { Effect, Layer } from "effect";
import { UserRepository } from "@/domain/user/UserRepository";
import { DatabaseService } from "@/infrastructure/db/service";
import { makeFindByChannelId } from "@/infrastructure/user/UserRepository/findByChannelId.live";
import { makeSoftDeleteWithDescriptions } from "@/infrastructure/user/UserRepository/softDeleteWithDescriptions.live";

export const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    return {
      findByChannelId: makeFindByChannelId(db),
      softDeleteWithDescriptions: makeSoftDeleteWithDescriptions(db),
    };
  }),
);
