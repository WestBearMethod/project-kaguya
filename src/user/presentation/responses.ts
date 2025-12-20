import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/shared/domain/primitives";
import { ChannelId } from "@/shared/domain/valueObjects";

export const DeleteUserResponse = Schema.Struct({
  channelId: ChannelId,
  deletedAt: AnnotatedDateFromSelf,
});

export type DeleteUserResponse = Schema.Schema.Type<typeof DeleteUserResponse>;
