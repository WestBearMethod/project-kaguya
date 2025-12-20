import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/shared/domain/primitives";
import { ChannelId, UserId } from "@/shared/domain/valueObjects";

export const UserFound = Schema.Struct({
  id: UserId,
  channelId: ChannelId,
  deletedAt: Schema.NullOr(AnnotatedDateFromSelf),
});

export interface UserFound extends Schema.Schema.Type<typeof UserFound> {}

export const DeletedUser = Schema.Struct({
  channelId: ChannelId,
  deletedAt: AnnotatedDateFromSelf,
});

export interface DeletedUser extends Schema.Schema.Type<typeof DeletedUser> {}
