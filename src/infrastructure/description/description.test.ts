import { describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { Elysia } from "elysia";
import { DeleteDescription } from "@/application/description/deleteDescription";
import { GetDescriptionContent } from "@/application/description/getDescriptionContent";
import { GetDescriptions } from "@/application/description/getDescriptions";
import { SaveDescription } from "@/application/description/saveDescription";
import { db } from "@/db";
import { descriptions, users } from "@/db/schema";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import {
  DescriptionContent,
  DescriptionSummary as DescriptionSummaryActual,
} from "@/domain/description/dtos";
import { Description as DescriptionActual } from "@/domain/description/entities";
import {
  replaceDateForTest,
  replaceNullableDateForTest,
} from "@/test-utils/schema";
import {
  createDescriptionController,
  descriptionController,
  ErrorSchema,
} from "./description";

const BASE_URL = "http://localhost";

const Description = DescriptionActual.pipe(
  replaceDateForTest("createdAt"),
  replaceNullableDateForTest("deletedAt"),
);

const DescriptionSummary = DescriptionSummaryActual.pipe(
  replaceDateForTest("createdAt"),
);

// Pagination response schema for testing
const PaginationResponse = Schema.Struct({
  items: Schema.Array(DescriptionSummary),
  nextCursor: Schema.NullOr(Schema.String),
});

const testUser = {
  channelId: "UC_DELETE_USER_123456789",
};

const testDescription = {
  title: "Test Video for Deletion",
  content: "This description will be soft deleted.",
  channelId: testUser.channelId,
};

const createTestDescription = async () => {
  const testApp = new Elysia().use(descriptionController);
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
  return Effect.runPromise(Schema.decodeUnknown(Description)(createdData));
};

const createDeleteRequest = (id: string, channelId: string) => {
  return new Request(`${BASE_URL}/descriptions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channelId }),
  });
};

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
      Schema.decodeUnknown(Description)(jsonData),
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

    const jsonData = await response.json();

    expect(jsonData).toHaveProperty("items");
    expect(jsonData).toHaveProperty("nextCursor");

    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(
        Schema.Struct({
          items: Schema.Array(DescriptionSummary),
          nextCursor: Schema.NullOr(Schema.String),
        }),
      )(jsonData),
    );

    expect(Array.isArray(decoded.items)).toBe(true);
    expect(decoded.items.length).toBeGreaterThan(0);
    expect(decoded.items[0].title).toBe(testDescription.title);
    expect(decoded.items[0].id).toBeDefined();
    expect(decoded.items[0].createdAt).toBeDefined();
  });

  it("GET /descriptions should support pagination", async () => {
    const paginationUser = {
      channelId: `UC_PAG_TEST_PAGINATION_0`,
    };
    await db
      .insert(users)
      .values(paginationUser)
      // Use onConflictDoNothing with target to be safe, though channelId should be unique
      .onConflictDoNothing({ target: users.channelId });

    // Cleanup: Delete existing descriptions for this user to ensure test idempotency
    await db
      .delete(descriptions)
      .where(eq(descriptions.channelId, paginationUser.channelId));

    // 2. Setup: Create 60 descriptions (> 50 limit)
    const totalCount = 60;
    const limit = 50;

    // We can insert directly to DB for speed, or use API. API is better integration test.
    // Using API loop.
    for (let i = 0; i < totalCount; i++) {
      await testApp.handle(
        new Request(`${BASE_URL}/descriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Pagination Video ${i}`,
            content: `Content ${i}`,
            channelId: paginationUser.channelId,
          }),
        }),
      );
    }

    // 3. Act: Fetch First Page
    const response1 = await testApp.handle(
      new Request(
        `${BASE_URL}/descriptions?channelId=${paginationUser.channelId}`,
      ),
    );

    expect(response1.status).toBe(200);

    const jsonData1 = await response1.json();
    const page1 = await Effect.runPromise(
      Schema.decodeUnknown(PaginationResponse)(jsonData1),
    );

    // 4. Assert: First Page
    expect(page1.items.length).toBe(limit);
    expect(page1.nextCursor).not.toBeNull();
    expect(page1.nextCursor).toBeString();

    // 5. Act: Fetch Second Page using cursor
    const response2 = await testApp.handle(
      new Request(
        `${BASE_URL}/descriptions?channelId=${paginationUser.channelId}&cursor=${page1.nextCursor}`,
      ),
    );

    expect(response2.status).toBe(200);

    const jsonData2 = await response2.json();
    const page2 = await Effect.runPromise(
      Schema.decodeUnknown(PaginationResponse)(jsonData2),
    );

    // 6. Assert: Second Page
    expect(page2.items.length).toBe(totalCount - limit); // Should be 10
    expect(page2.nextCursor).toBeNull();

    // 7. Verify no overlap and correct ordering (basic check)
    const ids1 = new Set(page1.items.map((i) => i.id));
    const ids2 = page2.items.map((i) => i.id);
    for (const id of ids2) {
      expect(ids1.has(id)).toBe(false);
    }
  });
});

describe("Description API - Error Handling", () => {
  const FailingRepositoryLive = Layer.succeed(DescriptionRepository, {
    save: () => Effect.fail(new Error("Database connection failed")),
    findByChannelId: () => Effect.fail(new Error("Database connection failed")),
    findById: () => Effect.fail(new Error("Database connection failed")),
    softDelete: (_command) =>
      Effect.fail(new Error("Database connection failed")),
  });

  const FailingAppLayer = Layer.mergeAll(
    SaveDescription.Live,
    GetDescriptions.Live,
    GetDescriptionContent.Live,
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
      createDeleteRequest(
        "00000000-0000-0000-0000-000000000000",
        testUser.channelId,
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

describe("Description API - Soft Delete", () => {
  const testApp = new Elysia().use(descriptionController);

  it("DELETE /descriptions/:id should soft delete a description", async () => {
    const created = await createTestDescription();

    const deleteResponse = await testApp.handle(
      createDeleteRequest(created.id, testUser.channelId),
    );

    expect(deleteResponse.status).toBe(200);
    const deletedData = await deleteResponse.json();
    const deleted = await Effect.runPromise(
      Schema.decodeUnknown(Description)(deletedData),
    );

    expect(deleted.id).toBe(created.id);
    expect(deleted.deletedAt).not.toBeNull();
  });

  it("GET /descriptions should not return soft-deleted descriptions", async () => {
    const created = await createTestDescription();

    await testApp.handle(createDeleteRequest(created.id, testUser.channelId));

    const getResponse = await testApp.handle(
      new Request(`${BASE_URL}/descriptions?channelId=${testUser.channelId}`),
    );

    expect(getResponse.status).toBe(200);
    const getData = await getResponse.json();
    const descriptions = await Effect.runPromise(
      Schema.decodeUnknown(
        Schema.Struct({
          items: Schema.Array(DescriptionSummary),
          nextCursor: Schema.NullOr(Schema.String),
        }),
      )(getData),
    );

    const foundDeleted = descriptions.items.find((d) => d.id === created.id);
    expect(foundDeleted).toBeUndefined();
  });

  it("DELETE /descriptions/:id should return 500 when trying to delete an already deleted description", async () => {
    const created = await createTestDescription();

    await testApp.handle(createDeleteRequest(created.id, testUser.channelId));

    const secondDeleteResponse = await testApp.handle(
      createDeleteRequest(created.id, testUser.channelId),
    );

    expect(secondDeleteResponse.status).toBe(500);

    const jsonData = await secondDeleteResponse.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(ErrorSchema)(jsonData),
    );

    expect(decoded.error).toBe("Internal Server Error");
  });

  it("DELETE /descriptions/:id should return 500 when deleting with different channelId (not owned)", async () => {
    const created = await createTestDescription();

    const differentChannelId = "UC_DIFFERENT_USER_999999";

    const deleteResponse = await testApp.handle(
      createDeleteRequest(created.id, differentChannelId),
    );

    expect(deleteResponse.status).toBe(500);

    const jsonData = await deleteResponse.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(ErrorSchema)(jsonData),
    );

    expect(decoded.error).toBe("Internal Server Error");

    // Verify the description still exists (not deleted)
    const verifyResponse = await testApp.handle(
      new Request(`${BASE_URL}/descriptions/${created.id}/content`),
    );
    expect(verifyResponse.status).toBe(200);
  });

  it("DELETE /descriptions/:id should return 500 for non-existent description", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const deleteResponse = await testApp.handle(
      createDeleteRequest(fakeId, testUser.channelId),
    );

    expect(deleteResponse.status).toBe(500);

    const jsonData = await deleteResponse.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(ErrorSchema)(jsonData),
    );

    expect(decoded.error).toBe("Internal Server Error");
  });
});

describe("Description API - Get Content", () => {
  const testApp = new Elysia().use(descriptionController);

  it("GET /descriptions/:id/content should return content", async () => {
    const created = await createTestDescription();

    const response = await testApp.handle(
      new Request(`${BASE_URL}/descriptions/${created.id}/content`),
    );

    expect(response.status).toBe(200);

    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(DescriptionContent)(jsonData),
    );

    expect(decoded.content).toBe(testDescription.content);
  });

  it("GET /descriptions/:id/content should return 404 for non-existent description", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const response = await testApp.handle(
      new Request(`${BASE_URL}/descriptions/${fakeId}/content`),
    );

    expect(response.status).toBe(404);

    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(ErrorSchema)(jsonData),
    );

    expect(decoded.error).toBe("Not found");
  });

  it("GET /descriptions/:id/content should return 404 for soft-deleted description", async () => {
    const created = await createTestDescription();

    await testApp.handle(createDeleteRequest(created.id, testUser.channelId));

    const response = await testApp.handle(
      new Request(`${BASE_URL}/descriptions/${created.id}/content`),
    );

    expect(response.status).toBe(404);

    const jsonData = await response.json();
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(ErrorSchema)(jsonData),
    );

    expect(decoded.error).toBe("Not found");
  });
});
