import { Schema } from "effect";
import {
  ChannelId,
  DescriptionCategory,
  DescriptionCursor,
  DescriptionId,
} from "./valueObjects";

export const GetDescriptionsQuery = Schema.Struct({
  channelId: ChannelId,
  cursor: Schema.optional(DescriptionCursor),
  category: Schema.optional(DescriptionCategory),
});

export interface GetDescriptionsQuery
  extends Schema.Schema.Type<typeof GetDescriptionsQuery> {}

export const GetDescriptionContentQuery = Schema.Struct({
  id: DescriptionId,
});

export interface GetDescriptionContentQuery
  extends Schema.Schema.Type<typeof GetDescriptionContentQuery> {}
