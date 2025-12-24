import { type Effect, type ParseResult, Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/shared/domain/primitives";
import { ChannelId, UserId } from "@/shared/domain/valueObjects";

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

/**
 * Domain Logic: Perform soft delete on a user entity
 */
export const softDeleteUser = (
  user: User,
): Effect.Effect<User, ParseResult.ParseError> =>
  Schema.decode(User)({
    ...user,
    deletedAt: new Date(),
  });
