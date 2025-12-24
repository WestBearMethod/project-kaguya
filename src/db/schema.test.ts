import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import { eq } from "drizzle-orm";
import type { DrizzleDb } from "@/db";
import { descriptions, users } from "@/db/schema";
import { setupTestDb } from "@/shared/infrastructure/db.test";

describe("Foreign Key Constraints - CASCADE", () => {
  let db: DrizzleDb;
  let teardownDb: () => Promise<void>;

  beforeAll(async () => {
    const setup = await setupTestDb();
    db = setup.db;
    teardownDb = setup.teardown;
  });

  afterAll(async () => {
    if (teardownDb) await teardownDb();
  });

  const testChannelId = "UC_CASCADE_TEST_001";
  const updatedChannelId = "UC_CASCADE_TEST_002";

  const cleanup = async () => {
    await db.delete(users).where(eq(users.channelId, testChannelId));
    await db.delete(users).where(eq(users.channelId, updatedChannelId));
  };

  beforeEach(async () => {
    await cleanup();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should CASCADE DELETE descriptions when user is deleted", async () => {
    await db.insert(users).values({ channelId: testChannelId });

    await db.insert(descriptions).values({
      title: "Test Description",
      content: "This should be deleted when user is deleted",
      channelId: testChannelId,
    });

    const beforeDelete = await db
      .select()
      .from(descriptions)
      .where(eq(descriptions.channelId, testChannelId));
    expect(beforeDelete.length).toBe(1);

    await db.delete(users).where(eq(users.channelId, testChannelId));

    const afterDelete = await db
      .select()
      .from(descriptions)
      .where(eq(descriptions.channelId, testChannelId));
    expect(afterDelete.length).toBe(0);
  });

  it("should CASCADE UPDATE descriptions when user channel_id is updated", async () => {
    await db.insert(users).values({ channelId: testChannelId });

    const [createdDesc] = await db
      .insert(descriptions)
      .values({
        title: "Test Description",
        content: "This channel_id should be updated when user is updated",
        channelId: testChannelId,
      })
      .returning();

    await db
      .update(users)
      .set({ channelId: updatedChannelId })
      .where(eq(users.channelId, testChannelId));

    const [updatedDesc] = await db
      .select()
      .from(descriptions)
      .where(eq(descriptions.id, createdDesc.id));

    expect(updatedDesc.channelId).toBe(updatedChannelId);
  });
});
