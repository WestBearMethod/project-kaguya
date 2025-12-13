import { Schema } from "effect";

const AnnotatedDateFromSelf = Schema.DateFromSelf.pipe(
  Schema.annotations({
    jsonSchema: {
      type: "string",
      format: "date-time", // ISO 8601 形式を示す
    },
  }),
);

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
    createdAt: AnnotatedDateFromSelf,
    deletedAt: Schema.NullOr(AnnotatedDateFromSelf),
  }),
);

// Type definition inferred from schema
export interface Description extends Schema.Schema.Type<typeof Description> {}

// Schema for list view (summary with title and timestamp only)
export const DescriptionSummary = Schema.Struct({
  id: Schema.UUID,
  title: Schema.String,
  createdAt: AnnotatedDateFromSelf,
});

export interface DescriptionSummary
  extends Schema.Schema.Type<typeof DescriptionSummary> {}

export const DescriptionContentRequest = Schema.Struct({
  id: Schema.UUID,
});

export interface DescriptionContentRequest
  extends Schema.Schema.Type<typeof DescriptionContentRequest> {}

// Schema for content retrieval
export const DescriptionContent = Schema.Struct({
  content: Schema.String,
});

export interface DescriptionContent
  extends Schema.Schema.Type<typeof DescriptionContent> {}
