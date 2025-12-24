import { type Brand, Schema } from "effect";
import { DescriptionStruct } from "@/description/domain/entities";
import {
  DescriptionContentText,
  DescriptionCursor,
} from "@/description/domain/valueObjects";

export const DescriptionSummary = DescriptionStruct.pipe(
  Schema.omit("content", "channelId", "deletedAt"),
  Schema.brand("DescriptionSummary"),
);

export interface DescriptionSummary
  extends Schema.Schema.Type<typeof DescriptionSummary>,
    Brand.Brand<"DescriptionSummary"> {}

export const PaginatedDescriptionSummary = Schema.Struct({
  items: Schema.Array(DescriptionSummary),
  nextCursor: Schema.NullOr(DescriptionCursor),
}).pipe(Schema.brand("PaginatedDescriptionSummary"));

export interface PaginatedDescriptionSummary
  extends Schema.Schema.Type<typeof PaginatedDescriptionSummary>,
    Brand.Brand<"PaginatedDescriptionSummary"> {}

export const DescriptionContent = Schema.Struct({
  content: DescriptionContentText,
}).pipe(Schema.brand("DescriptionContent"));

export interface DescriptionContent
  extends Schema.Schema.Type<typeof DescriptionContent>,
    Brand.Brand<"DescriptionContent"> {}
