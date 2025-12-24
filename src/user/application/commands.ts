import { Schema } from "effect";
import { ChannelId } from "@/shared/domain/valueObjects";

export const DeleteUserCommand = Schema.Struct({
  channelId: ChannelId,
});

export interface DeleteUserCommand
  extends Schema.Schema.Type<typeof DeleteUserCommand> {}
