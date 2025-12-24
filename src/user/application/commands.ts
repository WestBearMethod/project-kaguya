import { type Brand, Schema } from "effect";
import { ChannelId } from "@/shared/domain/valueObjects";

export const DeleteUserCommand = Schema.Struct({
  channelId: ChannelId,
}).pipe(Schema.brand("DeleteUserCommand"));

export interface DeleteUserCommand
  extends Schema.Schema.Type<typeof DeleteUserCommand>,
    Brand.Brand<"DeleteUserCommand"> {}
