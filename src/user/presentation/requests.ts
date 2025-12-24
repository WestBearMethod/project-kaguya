import { type Brand, Schema } from "effect";
import { ChannelId } from "@/shared/domain/valueObjects";

export const DeleteUserParams = Schema.Struct({
  channelId: ChannelId,
}).pipe(Schema.brand("DeleteUserParams"));

export interface DeleteUserParams
  extends Schema.Schema.Type<typeof DeleteUserParams>,
    Brand.Brand<"DeleteUserParams"> {}
