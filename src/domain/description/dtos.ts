import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/domain/shared/primitives";
import {
  DescriptionContentText,
  DescriptionCursor,
  DescriptionId,
  DescriptionTitle,
} from "./valueObjects";

/**
 * DTOs (Data Transfer Objects): Schemas for data transfer across layers
 * These are derived from the Description entity and represent different views/operations
 */

// Schema for list view (summary with title and timestamp only)
export const DescriptionSummary = Schema.Struct({
  id: DescriptionId,
  title: DescriptionTitle,
  createdAt: AnnotatedDateFromSelf,
});

export interface DescriptionSummary
  extends Schema.Schema.Type<typeof DescriptionSummary> {}

export const PaginatedDescriptionSummary = Schema.Struct({
  items: Schema.Chunk(DescriptionSummary),
  nextCursor: Schema.NullOr(DescriptionCursor),
});

export interface PaginatedDescriptionSummary
  extends Schema.Schema.Type<typeof PaginatedDescriptionSummary> {}

// Schema for content retrieval
export const DescriptionContent = Schema.Struct({
  content: DescriptionContentText,
});

export interface DescriptionContent
  extends Schema.Schema.Type<typeof DescriptionContent> {}
