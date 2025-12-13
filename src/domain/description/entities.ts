import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "../shared/primitives";
import {
  ChannelId,
  DescriptionContentText,
  DescriptionId,
  DescriptionTitle,
} from "./valueObjects";

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
