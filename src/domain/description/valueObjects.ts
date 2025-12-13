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
