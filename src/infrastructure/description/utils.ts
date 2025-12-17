import { Effect, Option } from "effect";

export const decodeCursor = (cursor: string | undefined | null) =>
  Effect.gen(function* () {
    if (!cursor) {
      return [Option.none(), Option.none()] as const;
    }

    return yield* Effect.try({
      try: () => {
        const decoded = Buffer.from(cursor, "base64").toString("utf-8");
        const [timeStr, idStr] = decoded.split("_");

        if (!timeStr || !idStr) {
          return [Option.none(), Option.none()] as const;
        }

        const date = new Date(timeStr);
        if (Number.isNaN(date.getTime())) {
          return [Option.none(), Option.none()] as const;
        }

        return [Option.some(date), Option.some(idStr)] as const;
      },
      catch: (e) => new Error(String(e)),
    }).pipe(
      Effect.tapError((e) => Effect.logWarning("Invalid cursor format", e)),
      Effect.catchAll(() =>
        Effect.succeed([Option.none(), Option.none()] as const),
      ),
    );
  });

export const encodeCursor = (cursor: {
  readonly createdAt: Date;
  readonly id: string;
}): string => {
  const cursorValue = `${cursor.createdAt.toISOString()}_${cursor.id}`;
  return Buffer.from(cursorValue).toString("base64");
};
