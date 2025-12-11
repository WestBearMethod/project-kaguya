import { describe, expect, it } from "bun:test";
import { Effect, Layer, Schema } from "effect";
import { Elysia } from "elysia";
import { GetDescriptions } from "@/application/description/getDescriptions";
import { SaveDescription } from "@/application/description/saveDescription";
import { DescriptionResponse } from "@/domain/description/Description";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import {
  createDescriptionController,
  descriptionController,
  ErrorSchema,
} from "./description";

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

describe("Description API - Error Handling", () => {
  const FailingRepositoryLive = Layer.succeed(DescriptionRepository, {
    save: () => Effect.fail(new Error("Database connection failed")),
    findByChannelId: () => Effect.fail(new Error("Database connection failed")),
  });

  const FailingAppLayer = Layer.mergeAll(
    SaveDescription.Live,
    GetDescriptions.Live,
  ).pipe(Layer.provide(FailingRepositoryLive));

  const failingController = createDescriptionController(FailingAppLayer);
  const testApp = new Elysia().use(failingController);

  const testDescription = {
    title: "Test Video",
    content: "This is a test description.",
    channelId: "UC_TEST_USER_12345678901",
  };

  it("POST /descriptions should return 500 on error without exposing details", async () => {
    const response = await testApp.handle(
      new Request(`${BASE_URL}/descriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testDescription),
      }),
    );

    expect(response.status).toBe(500);

    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(ErrorSchema)(jsonData),
    );

    expect(decoded.error).toBe("Internal Server Error");
  });

  it("GET /descriptions should return 500 on error without exposing details", async () => {
    const response = await testApp.handle(
      new Request(
        `${BASE_URL}/descriptions?channelId=UC_TEST_USER_12345678901`,
      ),
    );

    expect(response.status).toBe(500);

    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(ErrorSchema)(jsonData),
    );

    expect(decoded.error).toBe("Internal Server Error");
  });
});
