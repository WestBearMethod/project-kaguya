import { Schema } from "effect";
import { CreateDescriptionCommand } from "./dtos";
import { DescriptionId, DescriptionTitle } from "./valueObjects";

export const DescriptionResponse = Schema.extend(
  CreateDescriptionCommand,
  Schema.Struct({
    id: DescriptionId,
    createdAt: Schema.Date,
    deletedAt: Schema.NullOr(Schema.Date),
  }),
);

export interface DescriptionResponse
  extends Schema.Schema.Type<typeof DescriptionResponse> {}

export const DescriptionSummaryResponse = Schema.Struct({
  id: DescriptionId,
  title: DescriptionTitle,
  createdAt: Schema.Date,
});

export interface DescriptionSummaryResponse
  extends Schema.Schema.Type<typeof DescriptionSummaryResponse> {}
