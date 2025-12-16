import { describe, expect, it } from "bun:test";
import { Effect, Option } from "effect";
import { decodeCursor, encodeCursor } from "./utils";

describe("Description Utils", () => {
  describe("encodeCursor", () => {
    it("should correctly encode a cursor", () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      const id = "12345678-1234-1234-1234-123456789012";
      const cursor = encodeCursor({ createdAt: date, id });

      // Expected: base64("2023-01-01T00:00:00.000Z_12345678-1234-1234-1234-123456789012")
      const expectedOriginal = `${date.toISOString()}_${id}`;
      const expected = Buffer.from(expectedOriginal).toString("base64");

      expect(cursor).toBe(expected);
    });
  });

  describe("decodeCursor", () => {
    it("should correctly decode a valid cursor", async () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      const id = "12345678-1234-1234-1234-123456789012";
      const cursor = encodeCursor({ createdAt: date, id });

      const result = await Effect.runPromise(decodeCursor(cursor));

      expect(Option.isSome(result[0])).toBe(true);
      expect(Option.isSome(result[1])).toBe(true);

      if (Option.isSome(result[0]) && Option.isSome(result[1])) {
        expect(result[0].value.toISOString()).toBe(date.toISOString());
        expect(result[1].value).toBe(id);
      }
    });

    it("should return None for null/undefined cursor", async () => {
      const resultNull = await Effect.runPromise(decodeCursor(null));
      expect(Option.isNone(resultNull[0])).toBe(true);
      expect(Option.isNone(resultNull[1])).toBe(true);

      const resultUndefined = await Effect.runPromise(decodeCursor(undefined));
      expect(Option.isNone(resultUndefined[0])).toBe(true);
      expect(Option.isNone(resultUndefined[1])).toBe(true);
    });

    it("should return None for invalid base64 string", async () => {
      const result = await Effect.runPromise(decodeCursor("invalid-base64!"));
      expect(Option.isNone(result[0])).toBe(true);
      expect(Option.isNone(result[1])).toBe(true);
    });

    it("should return None for cursor with invalid format (no underscore)", async () => {
      const cursor = Buffer.from("just-a-string").toString("base64");
      const result = await Effect.runPromise(decodeCursor(cursor));

      // The implementation splits by "_". "just-a-string" has no underscore,
      // so [timeStr, idStr] = ["just-a-string", undefined].
      // The code checks `if (!timeStr || !idStr)`.
      expect(Option.isNone(result[0])).toBe(true);
      expect(Option.isNone(result[1])).toBe(true);
    });

    it("should return None for cursor with invalid date", async () => {
      const cursor = Buffer.from("invalid-date_some-id").toString("base64");
      const result = await Effect.runPromise(decodeCursor(cursor));

      expect(Option.isNone(result[0])).toBe(true);
      expect(Option.isNone(result[1])).toBe(true);
    });
  });
});
