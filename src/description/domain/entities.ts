import { type Brand, Effect, Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/shared/domain/primitives";
import { ChannelId } from "@/shared/domain/valueObjects";
import {
  DescriptionAlreadyDeletedError,
  PermissionDeniedError,
} from "./errors";
import {
  DescriptionCategory,
  DescriptionContentText,
  DescriptionId,
  DescriptionTitle,
} from "./valueObjects";

/**
 * Description Entity: The core domain entity representing a YouTube video description
 */
export const DescriptionStruct = Schema.Struct({
  id: DescriptionId,
  title: DescriptionTitle,
  content: DescriptionContentText,
  category: Schema.NullOr(DescriptionCategory),
  channelId: ChannelId,
  createdAt: AnnotatedDateFromSelf,
  deletedAt: Schema.NullOr(AnnotatedDateFromSelf),
});

export const Description = DescriptionStruct.pipe(Schema.brand("Description"));

// Type definition inferred from schema
export interface Description
  extends Schema.Schema.Type<typeof Description>,
    Brand.Brand<"Description"> {}

/**
 * DescriptionDraft: Data structure for creating a new Description.
 * It has the same validation rules as Description but without the ID and timestamps.
 */
export const DescriptionDraft = DescriptionStruct.pipe(
  Schema.omit("id", "createdAt", "deletedAt"),
  Schema.brand("DescriptionDraft"),
);

export interface DescriptionDraft
  extends Schema.Schema.Type<typeof DescriptionDraft>,
    Brand.Brand<"DescriptionDraft"> {}

export const isDescriptionDeleted = (description: Description): boolean =>
  description.deletedAt !== null;

export const softDeleteDescription = (
  description: Description,
  requestChannelId: ChannelId,
): Effect.Effect<
  Description,
  PermissionDeniedError | DescriptionAlreadyDeletedError
> =>
  Effect.gen(function* () {
    if (description.channelId !== requestChannelId) {
      return yield* Effect.fail(
        new PermissionDeniedError({
          id: description.id,
          reason: "Channel ID mismatch",
        }),
      );
    }

    if (isDescriptionDeleted(description)) {
      return yield* Effect.fail(
        new DescriptionAlreadyDeletedError({ id: description.id }),
      );
    }

    return Schema.decodeSync(Description)({
      ...description,
      deletedAt: Schema.decodeSync(AnnotatedDateFromSelf)(new Date()),
    });
  });
