import { type Brand, Schema } from "effect";
import { ChannelId } from "@/shared/domain/valueObjects";

export const GetUserByChannelIdQuery = Schema.Struct({
  channelId: ChannelId,
}).pipe(Schema.brand("GetUserByChannelIdQuery"));

export interface GetUserByChannelIdQuery
  extends Schema.Schema.Type<typeof GetUserByChannelIdQuery>,
    Brand.Brand<"GetUserByChannelIdQuery"> {}
