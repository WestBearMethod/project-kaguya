import type { Cause } from "effect";
import { Effect } from "effect";

export const logCauseInProduction = (
  message: string,
  cause: Cause.Cause<unknown>,
) => {
  if (process.env.NODE_ENV !== "test") {
    Effect.runSync(Effect.logError(message, cause));
  }
};

export const logErrorInProduction = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(message, error);
  }
};
