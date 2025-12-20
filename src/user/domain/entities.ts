import { Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/domain/shared/primitives";
import { ChannelId, UserId } from "@/domain/shared/valueObjects";

/**
 * User Entity: The core domain entity representing a User
 */
export const User = Schema.Struct({
  id: UserId,
  channelId: ChannelId,
  deletedAt: Schema.NullOr(AnnotatedDateFromSelf),
});

// Type definition inferred from schema
export interface User extends Schema.Schema.Type<typeof User> {}

/**
 * Domain Logic: Check if the user is already deleted
 */
export const isUserDeleted = (user: User): boolean => user.deletedAt !== null;
