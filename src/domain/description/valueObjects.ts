import { Schema } from "effect";

/**
 * Value Objects: Domain concepts with business rules
 * These represent the fundamental building blocks of the Description domain.
 */
export const DescriptionId = Schema.UUID.pipe(
  Schema.annotations({
    jsonSchema: {
      format: "uuid",
      description: "Unique Identifier (UUID)",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  }),
);

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
  Schema.maxLength(128),
);

export const DescriptionCategory = Schema.Literal(
  "GENERAL",
  "GAMING",
  "CHAT",
  "MUSIC",
  "EVENT",
  "COLLAB",
);

export type DescriptionCategory = Schema.Schema.Type<
  typeof DescriptionCategory
>;

export const PAGINATION_LIMIT = 50;
