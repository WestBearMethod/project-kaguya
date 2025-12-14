import { Schema } from "effect";

/**
 * Value Objects: Domain concepts with business rules
 * These represent the fundamental building blocks of the Description domain.
 */

export const DescriptionId = Schema.UUID;

export const ChannelId = Schema.String.pipe(Schema.length(24));

export const DescriptionTitle = Schema.String.pipe(
  Schema.minLength(1),
  Schema.maxLength(100),
);

export const DescriptionContentText = Schema.String.pipe(
  Schema.minLength(1),
  Schema.maxLength(5000),
);

const Base64Regex = /^[a-zA-Z0-9+/]*={0,2}$/;
export const DescriptionCursor = Schema.String.pipe(
  Schema.pattern(Base64Regex, { message: () => "Invalid base64 cursor" }),
);

export const DEFAULT_PAGINATION_LIMIT = 50;
export const PaginationLimit = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1, 100),
);
