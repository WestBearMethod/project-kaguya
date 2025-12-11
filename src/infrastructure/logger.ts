import type { Cause } from "effect";
import { Effect } from "effect";

export const logErrorInProduction = (
  message: string,
  cause: Cause.Cause<unknown>,
) => {
  if (process.env.NODE_ENV !== "test") {
    Effect.runSync(Effect.logError(message, cause));
  }
};
