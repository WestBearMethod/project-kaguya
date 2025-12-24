import { Data } from "effect";
import type { DescriptionId } from "@/description/domain/valueObjects";

export class DescriptionNotFoundError extends Data.TaggedError(
  "DescriptionNotFoundError",
)<{
  readonly id: DescriptionId;
}> {}

export class PermissionDeniedError extends Data.TaggedError(
  "PermissionDeniedError",
)<{
  readonly id: DescriptionId;
  readonly reason: string;
}> {}

export class DescriptionAlreadyDeletedError extends Data.TaggedError(
  "DescriptionAlreadyDeletedError",
)<{
  readonly id: DescriptionId;
}> {}

export type DescriptionDomainError =
  | DescriptionNotFoundError
  | PermissionDeniedError
  | DescriptionAlreadyDeletedError;
