import { type Brand, Schema } from "effect";
import { DescriptionSummary } from "@/description/application/dtos";
import { DescriptionCursor } from "@/description/domain/valueObjects";

export const GetDescriptionsResponse = Schema.Struct({
  items: Schema.Array(DescriptionSummary),
  nextCursor: Schema.NullOr(DescriptionCursor),
}).pipe(Schema.brand("GetDescriptionsResponse"));

export interface GetDescriptionsResponse
  extends Schema.Schema.Type<typeof GetDescriptionsResponse>,
    Brand.Brand<"GetDescriptionsResponse"> {}
