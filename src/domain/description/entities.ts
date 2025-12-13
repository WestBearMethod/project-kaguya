import { Schema } from "effect";
import { DescriptionId } from "./valueObjects";

const AnnotatedDateFromSelf = Schema.DateFromSelf.pipe(
  Schema.annotations({
    jsonSchema: {
      type: "string",
      format: "date-time", // ISO 8601 形式を示す
    },
  }),
);

/**
 * Description Entity: The core domain entity representing a YouTube video description
 */
export const Description = Schema.Struct({
  id: DescriptionId,
  title: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
  content: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(5000)),
  channelId: Schema.String.pipe(Schema.length(24)),
  createdAt: AnnotatedDateFromSelf,
  deletedAt: Schema.NullOr(AnnotatedDateFromSelf),
});

// Type definition inferred from schema
export interface Description extends Schema.Schema.Type<typeof Description> {}
