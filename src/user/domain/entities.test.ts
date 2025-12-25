import { describe, expect, it } from "bun:test";
import { Effect, Schema } from "effect";
import { ChannelId, UserId } from "@/shared/domain/valueObjects";
import { isUserDeleted, softDeleteUser, User } from "./entities";

describe("User Entity", () => {
  const mockUserId = Schema.decodeSync(UserId)(1);
  const mockChannelId = Schema.decodeSync(ChannelId)(
    "123456789012345678901234",
  );

  const mockUser: User = Schema.decodeSync(User)({
    id: mockUserId,
    channelId: mockChannelId,
    deletedAt: null,
  });

  describe("isUserDeleted", () => {
    it("should return false if deletedAt is null", () => {
      expect(isUserDeleted(mockUser)).toBe(false);
    });

    it("should return true if deletedAt is not null", () => {
      const deletedUser = Schema.decodeSync(User)({
        ...mockUser,
        deletedAt: new Date(),
      });
      expect(isUserDeleted(deletedUser)).toBe(true);
    });
  });

  describe("softDeleteUser", () => {
    it("should set deletedAt and return the updated user", async () => {
      const program = softDeleteUser(mockUser);
      const updatedUser = await Effect.runPromise(program);

      expect(updatedUser.deletedAt).toBeInstanceOf(Date);
      expect(updatedUser.id).toBe(mockUser.id);
      expect(updatedUser.channelId).toBe(mockUser.channelId);
    });
  });
});
