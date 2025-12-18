import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/domain/shared/primitives";
import { ChannelId, UserId } from "@/domain/shared/valueObjects";

export const UserFound = Schema.Struct({
  id: UserId,
  channelId: ChannelId,
});

export type UserFound = Schema.Schema.Type<typeof UserFound>;

export const DeletedUser = Schema.Struct({
  channelId: ChannelId,
  deletedAt: AnnotatedDateFromSelf,
});

export type DeletedUser = Schema.Schema.Type<typeof DeletedUser>;
