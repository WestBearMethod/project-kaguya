import { Schema } from "effect";
import { Description } from "@/domain/description/entities";
import {
  DescriptionContentText,
  DescriptionCursor,
} from "@/domain/description/valueObjects";

export const DescriptionSummary = Description.pipe(
  Schema.omit("content", "channelId", "deletedAt"),
);

export interface DescriptionSummary
  extends Schema.Schema.Type<typeof DescriptionSummary> {}

export const PaginatedDescriptionSummary = Schema.Struct({
  items: Schema.Array(DescriptionSummary),
  nextCursor: Schema.NullOr(DescriptionCursor),
});

export interface PaginatedDescriptionSummary
  extends Schema.Schema.Type<typeof PaginatedDescriptionSummary> {}

export const DescriptionContent = Schema.Struct({
  content: DescriptionContentText,
});

export interface DescriptionContent
  extends Schema.Schema.Type<typeof DescriptionContent> {}
