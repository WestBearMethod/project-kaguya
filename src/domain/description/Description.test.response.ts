import { Schema } from "effect";
import { CreateDescription } from "./Description";

export const DescriptionResponse = Schema.extend(
  CreateDescription,
  Schema.Struct({
    id: Schema.UUID,
    createdAt: Schema.Date,
    deletedAt: Schema.NullOr(Schema.Date),
  }),
);

export interface DescriptionResponse
  extends Schema.Schema.Type<typeof DescriptionResponse> {}

export const DescriptionSummaryResponse = Schema.Struct({
  id: Schema.UUID,
  title: Schema.String,
  createdAt: Schema.Date,
});

export interface DescriptionSummaryResponse
  extends Schema.Schema.Type<typeof DescriptionSummaryResponse> {}
