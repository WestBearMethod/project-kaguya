import { Option } from "effect";

export const decodeCursor = (
  cursor: string | undefined | null,
): readonly [Option.Option<Date>, Option.Option<string>] => {
  if (!cursor) {
    return [Option.none(), Option.none()] as const;
  }

  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const [timeStr, idStr] = decoded.split("_");

    if (!timeStr || !idStr) {
      return [Option.none(), Option.none()] as const;
    }

    const date = new Date(timeStr);
    if (Number.isNaN(date.getTime())) {
      console.warn(`Invalid date format in cursor: ${timeStr}`);
      return [Option.none(), Option.none()] as const;
    }

    return [Option.some(date), Option.some(idStr)] as const;
  } catch (e) {
    console.warn("Invalid cursor format", e);
    return [Option.none(), Option.none()] as const;
  }
};

export const encodeCursor = (cursor: {
  readonly createdAt: Date;
  readonly id: string;
}): string => {
  const cursorValue = `${cursor.createdAt.toISOString()}_${cursor.id}`;
  return Buffer.from(cursorValue).toString("base64");
};
