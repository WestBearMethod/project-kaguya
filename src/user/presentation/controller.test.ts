import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { Elysia } from "elysia";
import type { DrizzleDb } from "@/db";
import { descriptions, users } from "@/db/schema";
import { AppLayerContext } from "@/shared/application/layer";
import { ChannelId } from "@/shared/domain/valueObjects";
import { DatabaseService } from "@/shared/infrastructure/db";
import { DrizzleServiceLive } from "@/shared/infrastructure/db/DrizzleService.live";
import { setupTestDb } from "@/shared/infrastructure/db.test";
import { replaceDateForTest } from "@/shared/test-utils/schema";
import { DeleteUser } from "@/user/application/deleteUser";
import type { GetUserByChannelIdQuery } from "@/user/application/queries";
import { UserReader, UserWriter } from "@/user/application/UserRepository";
import type { User } from "@/user/domain/entities";
import { createUserController } from "@/user/presentation/controller";
import { DeleteUserResponse as DeleteUserResponseActual } from "@/user/presentation/responses";
import { ErrorSchema } from "@/user/presentation/schemas";

const BASE_URL = "http://localhost";

const DeleteUserResponse = DeleteUserResponseActual.pipe(
  replaceDateForTest("deletedAt"),
);

describe("User API Integration Tests", () => {
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
    const appLayer = AppLayerContext.pipe(
      Layer.provide(DrizzleServiceLive),
      Layer.provide(TestLayer),
    );
    const controller = createUserController(appLayer);
    return new Elysia().use(controller);
  };

  const testUser = {
    channelId: Schema.decodeSync(ChannelId)("UC_USER_DELETE_TEST_0001"),
  };

  describe("User Soft Delete", () => {
    it("DELETE /users/:channelId should soft delete a user and all their descriptions", async () => {
      const testApp = createTestApp();

      // Create user and descriptions
      await testDb
        .insert(users)
        .values(testUser)
        .onConflictDoNothing({ target: users.channelId });

      await testDb.insert(descriptions).values([
        {
          title: "Description 1",
          content: "Content 1",
          channelId: testUser.channelId,
        },
        {
          title: "Description 2",
          content: "Content 2",
          channelId: testUser.channelId,
        },
      ]);

      const deleteResponse = await testApp.handle(
        new Request(`${BASE_URL}/users/${testUser.channelId}`, {
          method: "DELETE",
        }),
      );

      expect(deleteResponse.status).toBe(200);
      const deletedData = await deleteResponse.json();
      const deleted = await Effect.runPromise(
        Schema.decodeUnknown(DeleteUserResponse)(deletedData),
      );

      expect(deleted.channelId).toBe(testUser.channelId);
      expect(deleted.deletedAt).toBeDefined();

      // Verify user is soft deleted
      const [user] = await testDb
        .select()
        .from(users)
        .where(eq(users.channelId, testUser.channelId));

      expect(user.deletedAt).not.toBeNull();

      // Verify all descriptions are soft deleted
      const userDescriptions = await testDb
        .select()
        .from(descriptions)
        .where(eq(descriptions.channelId, testUser.channelId));

      expect(userDescriptions.length).toBeGreaterThan(0);
      for (const desc of userDescriptions) {
        expect(desc.deletedAt).not.toBeNull();
      }
    });

    it("DELETE /users/:channelId should return 404 for non-existent user", async () => {
      const testApp = createTestApp();
      const fakeChannelId = Schema.decodeSync(ChannelId)(
        "UC_FAKE_USER_99999999999",
      );

      const deleteResponse = await testApp.handle(
        new Request(`${BASE_URL}/users/${fakeChannelId}`, {
          method: "DELETE",
        }),
      );

      expect(deleteResponse.status).toBe(404);
      const jsonData = await deleteResponse.json();
      const decoded = await Effect.runPromise(
        Schema.decodeUnknown(ErrorSchema)(jsonData),
      );

      expect(decoded.error).toBe("User Not Found");
    });

    it("DELETE /users/:channelId should return 409 when trying to delete an already deleted user", async () => {
      const testApp = createTestApp();
      const deletedUser = {
        channelId: Schema.decodeSync(ChannelId)("UC_ALREADY_DELETED_USER0"),
      };

      // Create and delete user
      await testDb
        .insert(users)
        .values(deletedUser)
        .onConflictDoNothing({ target: users.channelId });

      await testDb
        .update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.channelId, deletedUser.channelId));

      const deleteResponse = await testApp.handle(
        new Request(`${BASE_URL}/users/${deletedUser.channelId}`, {
          method: "DELETE",
        }),
      );

      expect(deleteResponse.status).toBe(409);
      const jsonData = await deleteResponse.json();
      const decoded = await Effect.runPromise(
        Schema.decodeUnknown(ErrorSchema)(jsonData),
      );

      expect(decoded.error).toBe("User Already Deleted");
    });
  });

  describe("User Soft Delete - Error Handling", () => {
    const FailingReaderLive = Layer.succeed(UserReader, {
      findByChannelId: (_query: GetUserByChannelIdQuery) =>
        Effect.fail(new Error("Database connection failed")),
    });

    const FailingWriterLive = Layer.succeed(UserWriter, {
      findEntityByChannelId: (_channelId: ChannelId) =>
        Effect.fail(new Error("Database connection failed")),
      softDelete: (_user: User) =>
        Effect.fail(new Error("Database connection failed")),
    });

    const FailingAppLayer = DeleteUser.Live.pipe(
      Layer.provide(Layer.mergeAll(FailingReaderLive, FailingWriterLive)),
    );

    const failingController = createUserController(FailingAppLayer);
    const testApp = new Elysia().use(failingController);

    it("DELETE /users/:channelId should return 500 on error without exposing details", async () => {
      const response = await testApp.handle(
        new Request(`${BASE_URL}/users/UC_TEST_USER_12345678901`, {
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
});
