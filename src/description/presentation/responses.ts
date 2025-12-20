import { Schema } from "effect";
import { DescriptionSummary } from "@/description/application/dtos";
import { DescriptionCursor } from "@/description/domain/valueObjects";

export const GetDescriptionsResponse = Schema.Struct({
  items: Schema.Array(DescriptionSummary),
  nextCursor: Schema.NullOr(DescriptionCursor),
});
