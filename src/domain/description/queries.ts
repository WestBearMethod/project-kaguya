import { Schema } from "effect";
import { ChannelId } from "../shared/valueObjects";
import {
  DescriptionCategory,
  DescriptionCursor,
  DescriptionId,
} from "./valueObjects";

export const GetDescriptionsQuery = Schema.Struct({
  channelId: ChannelId,
  cursor: Schema.optional(DescriptionCursor),
  category: Schema.optional(
    Schema.transform(
      Schema.Union(
        Schema.NullOr(DescriptionCategory),
        Schema.Literal("null", ""),
      ),
      Schema.NullOr(DescriptionCategory),
      {
        decode: (input) => (input === "null" || input === "" ? null : input),
        encode: (input) => input,
      },
    ),
  ),
});

export interface GetDescriptionsQuery
  extends Schema.Schema.Type<typeof GetDescriptionsQuery> {}

export const GetDescriptionContentQuery = Schema.Struct({
  id: DescriptionId,
});

export interface GetDescriptionContentQuery
  extends Schema.Schema.Type<typeof GetDescriptionContentQuery> {}
