import { describe, expect, it } from "bun:test";
import { Cause, Effect, Option, Schema } from "effect";
import { ChannelId } from "@/shared/domain/valueObjects";
import {
  Description,
  isDescriptionDeleted,
  softDeleteDescription,
} from "./entities";
import {
  DescriptionAlreadyDeletedError,
  PermissionDeniedError,
} from "./errors";
import {
  DescriptionContentText,
  DescriptionId,
  DescriptionTitle,
} from "./valueObjects";

describe("Description Entity", () => {
  const mockId = Schema.decodeSync(DescriptionId)(crypto.randomUUID());
  const mockTitle = Schema.decodeSync(DescriptionTitle)("Test Title");
  const mockContent = Schema.decodeSync(DescriptionContentText)("Test Content");
  const mockChannelId = Schema.decodeSync(ChannelId)(
    "123456789012345678901234",
  );
  const otherChannelId = Schema.decodeSync(ChannelId)(
    "999999999999999999999999",
  );

  const mockDescription: Description = Schema.decodeSync(Description)({
    id: mockId,
    title: mockTitle,
    content: mockContent,
    category: null,
    channelId: mockChannelId,
    createdAt: new Date(),
    deletedAt: null,
  });

  describe("isDescriptionDeleted", () => {
    it("should return false if deletedAt is null", () => {
      expect(isDescriptionDeleted(mockDescription)).toBe(false);
    });

    it("should return true if deletedAt is not null", () => {
      const deletedDescription = Schema.decodeSync(Description)({
        ...mockDescription,
        deletedAt: new Date(),
      });
      expect(isDescriptionDeleted(deletedDescription)).toBe(true);
    });
  });

  describe("softDeleteDescription", () => {
    it("should set deletedAt and return the updated description when channelId matches", async () => {
      const program = softDeleteDescription(mockDescription, mockChannelId);
      const updatedDescription = await Effect.runPromise(program);

      expect(updatedDescription.deletedAt).toBeInstanceOf(Date);
      expect(updatedDescription.id).toBe(mockDescription.id);
    });

    it("should fail with PermissionDeniedError when channelId mismatch", async () => {
      const program = softDeleteDescription(mockDescription, otherChannelId);
      const result = await Effect.runPromiseExit(program);

      expect(result._tag === "Failure").toBe(true);
      if (result._tag === "Failure") {
        const failure = Cause.failureOption(result.cause);
        expect(Option.isSome(failure)).toBe(true);
        if (Option.isSome(failure)) {
          expect(failure.value).toBeInstanceOf(PermissionDeniedError);
        }
      }
    });

    it("should fail with DescriptionAlreadyDeletedError when already deleted", async () => {
      const deletedDescription = Schema.decodeSync(Description)({
        ...mockDescription,
        deletedAt: new Date(),
      });
      const program = softDeleteDescription(deletedDescription, mockChannelId);
      const result = await Effect.runPromiseExit(program);

      expect(result._tag === "Failure").toBe(true);
      if (result._tag === "Failure") {
        const failure = Cause.failureOption(result.cause);
        expect(Option.isSome(failure)).toBe(true);
        if (Option.isSome(failure)) {
          expect(failure.value).toBeInstanceOf(DescriptionAlreadyDeletedError);
        }
      }
    });
  });
});
