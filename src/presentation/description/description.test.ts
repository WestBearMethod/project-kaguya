import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { Elysia } from "elysia";
import { AppLayerContext, UseCasesLive } from "@/application/layer";
import type { DrizzleDb } from "@/db";
import { descriptions, users } from "@/db/schema";
import type {
  CreateDescriptionCommand,
  DeleteDescriptionCommand,
} from "@/domain/description/commands";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import {
  DescriptionContent,
  DescriptionSummary as DescriptionSummaryActual,
} from "@/domain/description/dtos";
import { Description as DescriptionActual } from "@/domain/description/entities";
import type {
  GetDescriptionContentQuery,
  GetDescriptionsQuery,
} from "@/domain/description/queries";
import { DatabaseService } from "@/infrastructure/db/service";
import { setupTestDb } from "@/infrastructure/db/test";
import { createDescriptionController } from "@/presentation/description/description";
import { ErrorSchema } from "@/presentation/description/schemas";
import {
  replaceDateForTest,
  replaceNullableDateForTest,
} from "@/test-utils/schema";

const BASE_URL = "http://localhost";

const Description = DescriptionActual.pipe(
  replaceDateForTest("createdAt"),
  replaceNullableDateForTest("deletedAt"),
);

const DescriptionSummary = DescriptionSummaryActual.pipe(
  replaceDateForTest("createdAt"),
);

const PaginationResponse = Schema.Struct({
  items: Schema.Array(DescriptionSummary),
  nextCursor: Schema.NullOr(Schema.String),
});

const createDeleteRequest = (id: string, channelId: string) => {
  return new Request(`${BASE_URL}/descriptions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channelId }),
  });
};

describe("Description API Integration Tests", () => {
  let testDb: DrizzleDb;
  let teardownDb: () => Promise<void>;
  let TestLayer: Layer.Layer<DatabaseService>;

  beforeAll(async () => {
    const setup = await setupTestDb();
    testDb = setup.db;
    teardownDb = setup.teardown;
    TestLayer = Layer.succeed(DatabaseService, testDb);
  });

  afterAll(async () => {
    if (teardownDb) await teardownDb();
  });

  const createTestApp = () => {
    const appLayer = AppLayerContext.pipe(Layer.provide(TestLayer));
    const controller = createDescriptionController(appLayer);
    return new Elysia().use(controller);
  };

  const testUser = {
    channelId: "UC_TEST_USER_12345678901",
  };

  const testDescription = {
    title: "Test Video",
    content: "This is a test description.",
    channelId: testUser.channelId,
  };

  // Helper inside describe to access createTestApp
  const createTestDescription = async () => {
    const testApp = createTestApp();

    // Create soft-delete test description
    const deleteTestDesc = {
      ...testDescription,
      title: "To Be Deleted",
      channelId: "UC_DELETE_USER_123456789",
    };

    const createResponse = await testApp.handle(
      new Request(`${BASE_URL}/descriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteTestDesc),
      }),
    );

    expect(createResponse.status).toBe(200);
    const createdData = await createResponse.json();
    return Effect.runPromise(Schema.decodeUnknown(Description)(createdData));
  };

  describe("Description API", () => {
    it("POST /descriptions should create a description", async () => {
      const testApp = createTestApp();
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

      const jsonData = await response.json();
      const decoded = await Effect.runPromise(
        Schema.decodeUnknown(Description)(jsonData),
      );

      expect(decoded.id).toBeDefined();
      expect(decoded.title).toBe(testDescription.title);
      expect(decoded.channelId).toBe(testDescription.channelId);
    });

    it("GET /descriptions should return list", async () => {
      const testApp = createTestApp();
      const response = await testApp.handle(
        new Request(`${BASE_URL}/descriptions?channelId=${testUser.channelId}`),
      );

      expect(response.status).toBe(200);
      const jsonData = await response.json();

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
    });

    it("GET /descriptions should support pagination", async () => {
      const testApp = createTestApp();
      const paginationUser = {
        channelId: `UC_PAG_TEST_PAGINATION_0`,
      };

      await testDb
        .insert(users)
        .values(paginationUser)
        .onConflictDoNothing({ target: users.channelId });

      await testDb
        .delete(descriptions)
        .where(eq(descriptions.channelId, paginationUser.channelId));

      const totalCount = 60;
      const limit = 50;

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

      expect(page1.items.length).toBe(limit);
      expect(page1.nextCursor).not.toBeNull();

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

      expect(page2.items.length).toBe(totalCount - limit);
      expect(page2.nextCursor).toBeNull();
    });
  });

  describe("Description API - Soft Delete", () => {
    it("DELETE /descriptions/:id should soft delete a description", async () => {
      const created = await createTestDescription();
      const testApp = createTestApp();

      const deleteResponse = await testApp.handle(
        createDeleteRequest(created.id, created.channelId),
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
      const testApp = createTestApp();

      await testApp.handle(createDeleteRequest(created.id, created.channelId));

      const getResponse = await testApp.handle(
        new Request(`${BASE_URL}/descriptions?channelId=${created.channelId}`),
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
      const testApp = createTestApp();

      await testApp.handle(createDeleteRequest(created.id, created.channelId));

      const secondDeleteResponse = await testApp.handle(
        createDeleteRequest(created.id, created.channelId),
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
      const testApp = createTestApp();

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
    });

    it("DELETE /descriptions/:id should return 500 for non-existent description", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const testApp = createTestApp();

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

  describe("Description API - Error Handling", () => {
    const FailingRepositoryLive = Layer.succeed(DescriptionRepository, {
      save: (_command: CreateDescriptionCommand) =>
        Effect.fail(new Error("Database connection failed")),
      findByChannelId: (_query: GetDescriptionsQuery) =>
        Effect.fail(new Error("Database connection failed")),
      findById: (_query: GetDescriptionContentQuery) =>
        Effect.fail(new Error("Database connection failed")),
      softDelete: (_command: DeleteDescriptionCommand) =>
        Effect.fail(new Error("Database connection failed")),
    });

    const FailingAppLayer = UseCasesLive.pipe(
      Layer.provide(FailingRepositoryLive),
    );

    const failingController = createDescriptionController(FailingAppLayer);
    const testApp = new Elysia().use(failingController);

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

  describe("Description API - Get Content", () => {
    it("GET /descriptions/:id/content should return content", async () => {
      const created = await createTestDescription();
      const testApp = createTestApp();

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
  });

  describe("Description API - Category", () => {
    const categoryUser = {
      channelId: "UC_CATEGORY_TEST_USER_01",
    };

    const createCategoryRequest = (
      category: string | null | undefined,
      channelId = categoryUser.channelId,
    ) =>
      new Request(`${BASE_URL}/descriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Category Test Video",
          content: "Testing category feature",
          channelId,
          category,
        }),
      });

    beforeEach(async () => {
      if (testDb) {
        await testDb
          .delete(descriptions)
          .where(eq(descriptions.channelId, categoryUser.channelId));
      }
    });

    it("POST /descriptions should create description with category", async () => {
      const testApp = createTestApp();
      const response = await testApp.handle(createCategoryRequest("GAMING"));
      expect(response.status).toBe(200);

      const jsonData = await response.json();
      const decoded = await Effect.runPromise(
        Schema.decodeUnknown(Description)(jsonData),
      );

      expect(decoded.category).toBe("GAMING");
      expect(decoded.channelId).toBe(categoryUser.channelId);
    });

    it("GET /descriptions should filter by category", async () => {
      const testApp = createTestApp();
      // Setup scenarios
      await testApp.handle(createCategoryRequest("GAMING"));
      await testApp.handle(createCategoryRequest("GAMING"));
      await testApp.handle(createCategoryRequest("MUSIC"));
      await testApp.handle(createCategoryRequest(null));

      // Filter GAMING
      const responseGaming = await testApp.handle(
        new Request(
          `${BASE_URL}/descriptions?channelId=${categoryUser.channelId}&category=GAMING`,
        ),
      );
      expect(responseGaming.status).toBe(200);
      const jsonGaming = await responseGaming.json();
      const decodedGaming = await Effect.runPromise(
        Schema.decodeUnknown(PaginationResponse)(jsonGaming),
      );
      expect(decodedGaming.items.length).toBe(2);
    });
  });
});
