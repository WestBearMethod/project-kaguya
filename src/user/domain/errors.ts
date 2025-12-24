import { Data } from "effect";
import type { ChannelId } from "@/shared/domain/valueObjects";

export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  readonly channelId: ChannelId;
}> {}

export class UserAlreadyDeletedError extends Data.TaggedError(
  "UserAlreadyDeletedError",
)<{
  readonly channelId: ChannelId;
}> {}

export type UserDomainError = UserNotFoundError | UserAlreadyDeletedError;
