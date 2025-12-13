import { Schema } from "effect";
import {
  ChannelId,
  DescriptionContentText,
  DescriptionId,
  DescriptionTitle,
} from "./valueObjects";

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
  title: DescriptionTitle,
  content: DescriptionContentText,
  channelId: ChannelId,
  createdAt: AnnotatedDateFromSelf,
  deletedAt: Schema.NullOr(AnnotatedDateFromSelf),
});

// Type definition inferred from schema
export interface Description extends Schema.Schema.Type<typeof Description> {}
