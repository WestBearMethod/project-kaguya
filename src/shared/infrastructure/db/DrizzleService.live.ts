import { Effect, Layer, Runtime } from "effect";
import type { DrizzleQueryable } from "@/db";
import { DatabaseService } from "@/shared/infrastructure/db";
import { DrizzleService, type IDrizzleService } from "./DrizzleService";

export const DrizzleServiceLive = Layer.effect(
  DrizzleService,
  Effect.gen(function* () {
    const rootDb = yield* DatabaseService;

    const makeService = (db: DrizzleQueryable): IDrizzleService => ({
      run: (fn) =>
        Effect.tryPromise({
          try: () => fn(db),
          catch: (error) =>
            error instanceof Error ? error : new Error(String(error)),
        }),

      transaction: <A, E, R>(body: Effect.Effect<A, E, R>) =>
        Effect.gen(function* () {
          const runtime = yield* Effect.runtime<Exclude<R, DrizzleService>>();
          return yield* Effect.tryPromise({
            try: () =>
              db.transaction((tx) =>
                Runtime.runPromise(runtime)(
                  body.pipe(
                    Effect.provideService(DrizzleService, makeService(tx)),
                  ),
                ),
              ),
            catch: (error) =>
              error instanceof Error ? error : new Error(String(error)),
          });
        }),
    });

    return makeService(rootDb);
  }),
);
