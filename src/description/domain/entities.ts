import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "../../domain/shared/primitives";
import { ChannelId } from "../../domain/shared/valueObjects";
import {
  DescriptionCategory,
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
  category: Schema.NullOr(DescriptionCategory),
  channelId: ChannelId,
  createdAt: AnnotatedDateFromSelf,
  deletedAt: Schema.NullOr(AnnotatedDateFromSelf),
});

// Type definition inferred from schema
export interface Description extends Schema.Schema.Type<typeof Description> {}

/**
 * DescriptionDraft: Data structure for creating a new Description.
 * It has the same validation rules as Description but without the ID and timestamps.
 */
export const DescriptionDraft = Description.pipe(
  Schema.omit("id", "createdAt", "deletedAt"),
);

export interface DescriptionDraft
  extends Schema.Schema.Type<typeof DescriptionDraft> {}
