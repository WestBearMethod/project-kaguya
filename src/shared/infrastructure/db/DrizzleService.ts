import { Context, type Effect } from "effect";
import type { DrizzleQueryable } from "@/db";

export interface IDrizzleService {
  /**
   * 単一のクエリ（または複数のクエリ）を実行し、その結果を Effect として返す
   */
  readonly run: <A>(
    fn: (db: DrizzleQueryable) => Promise<A>,
  ) => Effect.Effect<A, Error>;

  /**
   * トランザクションを実行し、その結果を Effect として返す
   * body の中で DrizzleService を要求する場合、このトランザクションによって供給される
   */
  readonly transaction: <A, E, R>(
    body: Effect.Effect<A, E, R>,
  ) => Effect.Effect<A, E | Error, Exclude<R, DrizzleService>>;
}

export class DrizzleService extends Context.Tag("DrizzleService")<
  DrizzleService,
  IDrizzleService
>() {}
