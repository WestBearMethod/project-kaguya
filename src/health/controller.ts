import { type Brand, Schema } from "effect";
import { Elysia } from "elysia";

export const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
}).pipe(Schema.brand("HealthResponse"));

export interface HealthResponse
  extends Schema.Schema.Type<typeof HealthResponse>,
    Brand.Brand<"HealthResponse"> {}

export const healthController = new Elysia().get(
  "/health",
  () => {
    return Schema.decodeSync(HealthResponse)({ status: "ok" as const });
  },
  {
    response: {
      200: Schema.standardSchemaV1(HealthResponse),
    },
  },
);
