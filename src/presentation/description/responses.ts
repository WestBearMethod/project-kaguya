import { Schema } from "effect";
import { DescriptionSummary } from "@/application/description/dtos";
import { DescriptionCursor } from "@/domain/description/valueObjects";

export const GetDescriptionsResponse = Schema.Struct({
  items: Schema.Array(DescriptionSummary),
  nextCursor: Schema.NullOr(DescriptionCursor),
});
