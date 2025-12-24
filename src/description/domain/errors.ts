import { Data } from "effect";

export class DescriptionNotFoundError extends Data.TaggedError(
  "DescriptionNotFoundError",
)<{
  readonly id: string;
}> {}

export class PermissionDeniedError extends Data.TaggedError(
  "PermissionDeniedError",
)<{
  readonly id: string;
  readonly reason: string;
}> {}

export class DescriptionAlreadyDeletedError extends Data.TaggedError(
  "DescriptionAlreadyDeletedError",
)<{
  readonly id: string;
}> {}

export type DescriptionDomainError =
  | DescriptionNotFoundError
  | PermissionDeniedError
  | DescriptionAlreadyDeletedError;
