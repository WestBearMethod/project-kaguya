import { describe, expect, it } from "bun:test";
import { Effect, Schema } from "effect";
import { Elysia } from "elysia";
import { HealthResponse, healthController } from "@/health/controller";

const BASE_URL = "http://localhost";

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
