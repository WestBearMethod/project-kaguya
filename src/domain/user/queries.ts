import { Schema } from "effect";
import { ChannelId } from "@/domain/shared/valueObjects";

export const GetUserByChannelIdQuery = Schema.Struct({
  channelId: ChannelId,
});

export interface GetUserByChannelIdQuery
  extends Schema.Schema.Type<typeof GetUserByChannelIdQuery> {}
