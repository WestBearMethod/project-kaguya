import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/domain/shared/primitives";
import { Description } from "./entities";
import {
  DescriptionContentText,
  DescriptionId,
  DescriptionTitle,
} from "./valueObjects";

/**
 * DTOs (Data Transfer Objects): Schemas for data transfer across layers
 * These are derived from the Description entity and represent different views/operations
 */

// CQRS Pattern: Command for creating a description
// Derived from Description entity by omitting server-generated fields
export const CreateDescriptionCommand = Description.pipe(
  Schema.omit("id", "createdAt", "deletedAt"),
);

export interface CreateDescriptionCommand
  extends Schema.Schema.Type<typeof CreateDescriptionCommand> {}

// Schema for list view (summary with title and timestamp only)
export const DescriptionSummary = Schema.Struct({
  id: DescriptionId,
  title: DescriptionTitle,
  createdAt: AnnotatedDateFromSelf,
});

export interface DescriptionSummary
  extends Schema.Schema.Type<typeof DescriptionSummary> {}

// Schema for content retrieval
export const DescriptionContent = Schema.Struct({
  content: DescriptionContentText,
});

export interface DescriptionContent
  extends Schema.Schema.Type<typeof DescriptionContent> {}
