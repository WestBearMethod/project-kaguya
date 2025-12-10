import { describe, expect, it } from "bun:test";
import { Effect, Schema } from "effect";
import { Elysia } from "elysia";
import { DescriptionResponse } from "@/domain/description/Description";
import { descriptionController } from "./description";

const BASE_URL = "http://localhost";

describe("Description API", () => {
  const testApp = new Elysia().use(descriptionController);

  const testUser = {
    channelId: "UC_TEST_USER_12345678901",
  };

  const testDescription = {
    title: "Test Video",
    content: "This is a test description.",
    channelId: testUser.channelId,
  };

  it("POST /descriptions should create a description", async () => {
    const response = await testApp.handle(
      new Request(`${BASE_URL}/descriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testDescription),
      }),
    );

    expect(response.status).toBe(200);

    // Use Schema.decodeUnknown to parse and validate the response
    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(DescriptionResponse)(jsonData),
    );

    expect(decoded.id).toBeDefined();
    expect(decoded.title).toBe(testDescription.title);
    expect(decoded.channelId).toBe(testDescription.channelId);
  });

  it("GET /descriptions should return list", async () => {
    const response = await testApp.handle(
      new Request(`${BASE_URL}/descriptions?channelId=${testUser.channelId}`),
    );

    expect(response.status).toBe(200);

    // Use Schema.decodeUnknown to parse and validate the response as an array
    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(Schema.Array(DescriptionResponse))(jsonData),
    );

    expect(Array.isArray(decoded)).toBe(true);
    expect(decoded.length).toBeGreaterThan(0);
    expect(decoded[0].title).toBe(testDescription.title);
  });
});
