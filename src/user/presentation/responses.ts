import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/domain/shared/primitives";
import { ChannelId } from "@/domain/shared/valueObjects";

export const DeleteUserResponse = Schema.Struct({
  channelId: ChannelId,
  deletedAt: AnnotatedDateFromSelf,
});

export type DeleteUserResponse = Schema.Schema.Type<typeof DeleteUserResponse>;
