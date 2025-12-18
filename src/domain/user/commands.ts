import { Schema } from "effect";
import { ChannelId } from "@/domain/shared/valueObjects";

export const DeleteUserCommand = Schema.Struct({
  channelId: ChannelId,
});

export type DeleteUserCommand = Schema.Schema.Type<typeof DeleteUserCommand>;
