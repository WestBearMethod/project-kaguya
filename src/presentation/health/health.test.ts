import { describe, expect, it } from "bun:test";
import { Effect, Schema } from "effect";
import { Elysia } from "elysia";
import { healthController } from "@/presentation/health/health";

const BASE_URL = "http://localhost";

const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
});

describe("Health API", () => {
  const testApp = new Elysia().use(healthController);

  it("GET /health should return ok status", async () => {
    const response = await testApp.handle(new Request(`${BASE_URL}/health`));

    expect(response.status).toBe(200);

    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(HealthResponse)(jsonData),
    );

    expect(decoded.status).toBe("ok");
  });
});
