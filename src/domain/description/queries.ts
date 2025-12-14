import { Schema } from "effect";
import {
  ChannelId,
  DEFAULT_PAGINATION_LIMIT,
  DescriptionCursor,
  DescriptionId,
  PaginationLimit,
} from "./valueObjects";

export const GetDescriptionsQuery = Schema.Struct({
  channelId: ChannelId,
  cursor: Schema.optional(DescriptionCursor),
  limit: Schema.optionalWith(
    Schema.NumberFromString.pipe(Schema.compose(PaginationLimit)),
    {
      default: () => DEFAULT_PAGINATION_LIMIT,
    },
  ),
});

export interface GetDescriptionsQuery
  extends Schema.Schema.Type<typeof GetDescriptionsQuery> {}

export const GetDescriptionContentQuery = Schema.Struct({
  id: DescriptionId,
});

export interface GetDescriptionContentQuery
  extends Schema.Schema.Type<typeof GetDescriptionContentQuery> {}
