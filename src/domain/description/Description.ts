import { Schema } from "effect";

// Schema for creating a description (id and createdAt are generated)
export const CreateDescription = Schema.Struct({
  title: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
  content: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(5000)),
  channelId: Schema.String.pipe(Schema.length(24)),
});

export interface CreateDescription
  extends Schema.Schema.Type<typeof CreateDescription> {}

// Define the Description schema by extending CreateDescription
export const Description = Schema.extend(
  CreateDescription,
  Schema.Struct({
    id: Schema.UUID,
    createdAt: Schema.DateFromSelf,
    deletedAt: Schema.NullOr(Schema.DateFromSelf),
  }),
);

// Type definition inferred from schema
export interface Description extends Schema.Schema.Type<typeof Description> {}

// Schema for list view (summary with title and timestamp only)
export const DescriptionSummary = Schema.Struct({
  id: Schema.UUID,
  title: Schema.String,
  createdAt: Schema.DateFromSelf,
});

export interface DescriptionSummary
  extends Schema.Schema.Type<typeof DescriptionSummary> {}

// Schema for content retrieval
export const DescriptionContent = Schema.Struct({
  content: Schema.String,
});

export interface DescriptionContent
  extends Schema.Schema.Type<typeof DescriptionContent> {}
