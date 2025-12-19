import { Data } from "effect";

export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  readonly channelId: string;
}> {}

export class UserAlreadyDeletedError extends Data.TaggedError(
  "UserAlreadyDeletedError",
)<{
  readonly channelId: string;
}> {}

export type UserDomainError = UserNotFoundError | UserAlreadyDeletedError;
