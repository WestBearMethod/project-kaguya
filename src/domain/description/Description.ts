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

// Schema for JSON Response (Date is serialized to ISO string)
export const DescriptionResponse = Schema.extend(
  CreateDescription,
  Schema.Struct({
    id: Schema.UUID,
    createdAt: Schema.Date, // Accepts ISO string from JSON
    deletedAt: Schema.NullOr(Schema.Date),
  }),
);

export interface DescriptionResponse
  extends Schema.Schema.Type<typeof DescriptionResponse> {}
