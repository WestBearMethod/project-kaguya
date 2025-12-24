import { Schema } from "effect";
import { ChannelId } from "@/shared/domain/valueObjects";

export const DeleteUserParams = Schema.Struct({
  channelId: ChannelId,
});

export type DeleteUserParams = Schema.Schema.Type<typeof DeleteUserParams>;
