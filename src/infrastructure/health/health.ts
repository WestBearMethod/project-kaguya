import { Schema } from "effect";
import { Elysia } from "elysia";

const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
});

export const healthController = new Elysia().get(
  "/health",
  () => {
    return { status: "ok" as const };
  },
  {
    response: {
      200: Schema.standardSchemaV1(HealthResponse),
    },
  },
);
