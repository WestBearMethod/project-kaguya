import { describe, expect, it } from "bun:test";
import { Effect, Layer, Schema } from "effect";
import { Elysia } from "elysia";
import { DeleteDescription } from "@/application/description/deleteDescription";
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
    softDelete: () => Effect.fail(new Error("Database connection failed")),
  });

  const FailingAppLayer = Layer.mergeAll(
    SaveDescription.Live,
    GetDescriptions.Live,
    DeleteDescription.Live,
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

  it("DELETE /descriptions/:id should return 500 on error without exposing details", async () => {
    const response = await testApp.handle(
      new Request(`${BASE_URL}/descriptions/some-uuid-here`, {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(500);

    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(ErrorSchema)(jsonData),
    );

    expect(decoded.error).toBe("Internal Server Error");
  });
});

describe("Description API - Soft Delete", () => {
  const testApp = new Elysia().use(descriptionController);

  const testUser = {
    channelId: "UC_DELETE_USER_123456789",
  };

  const testDescription = {
    title: "Test Video for Deletion",
    content: "This description will be soft deleted.",
    channelId: testUser.channelId,
  };

  it("DELETE /descriptions/:id should soft delete a description", async () => {
    const createResponse = await testApp.handle(
      new Request(`${BASE_URL}/descriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testDescription),
      }),
    );

    expect(createResponse.status).toBe(200);
    const createdData = await createResponse.json();
    const created = await Effect.runPromise(
      Schema.decodeUnknown(DescriptionResponse)(createdData),
    );

    const deleteResponse = await testApp.handle(
      new Request(`${BASE_URL}/descriptions/${created.id}`, {
        method: "DELETE",
      }),
    );

    expect(deleteResponse.status).toBe(200);
    const deletedData = await deleteResponse.json();
    const deleted = await Effect.runPromise(
      Schema.decodeUnknown(DescriptionResponse)(deletedData),
    );

    expect(deleted.id).toBe(created.id);
    expect(deleted.deletedAt).not.toBeNull();
  });

  it("GET /descriptions should not return soft-deleted descriptions", async () => {
    const createResponse = await testApp.handle(
      new Request(`${BASE_URL}/descriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testDescription),
      }),
    );

    const createdData = await createResponse.json();
    const created = await Effect.runPromise(
      Schema.decodeUnknown(DescriptionResponse)(createdData),
    );

    await testApp.handle(
      new Request(`${BASE_URL}/descriptions/${created.id}`, {
        method: "DELETE",
      }),
    );

    const getResponse = await testApp.handle(
      new Request(`${BASE_URL}/descriptions?channelId=${testUser.channelId}`),
    );

    expect(getResponse.status).toBe(200);
    const getData = await getResponse.json();
    const descriptions = await Effect.runPromise(
      Schema.decodeUnknown(Schema.Array(DescriptionResponse))(getData),
    );

    const foundDeleted = descriptions.find((d) => d.id === created.id);
    expect(foundDeleted).toBeUndefined();
  });
});
