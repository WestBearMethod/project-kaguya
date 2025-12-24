import { Schema } from "effect";
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
});

export interface GetDescriptionsQuery
  extends Schema.Schema.Type<typeof GetDescriptionsQuery> {}

export const GetDescriptionContentQuery = Schema.Struct({
  id: DescriptionId,
});

export interface GetDescriptionContentQuery
  extends Schema.Schema.Type<typeof GetDescriptionContentQuery> {}
