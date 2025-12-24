import { type Brand, Schema } from "effect";
import {
  DescriptionCategory,
  DescriptionCursor,
  DescriptionId,
} from "@/description/domain/valueObjects";
import { ChannelId } from "@/shared/domain/valueObjects";

export const GetDescriptionsQuery = Schema.Struct({
  channelId: ChannelId,
  category: Schema.optional(Schema.NullOr(DescriptionCategory)),
  cursor: Schema.optional(Schema.NullOr(DescriptionCursor)),
}).pipe(Schema.brand("GetDescriptionsQuery"));

export interface GetDescriptionsQuery
  extends Schema.Schema.Type<typeof GetDescriptionsQuery>,
    Brand.Brand<"GetDescriptionsQuery"> {}

export const GetDescriptionContentQuery = Schema.Struct({
  id: DescriptionId,
}).pipe(Schema.brand("GetDescriptionContentQuery"));

export interface GetDescriptionContentQuery
  extends Schema.Schema.Type<typeof GetDescriptionContentQuery>,
    Brand.Brand<"GetDescriptionContentQuery"> {}
