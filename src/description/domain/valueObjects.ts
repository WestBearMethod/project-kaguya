import { Schema } from "effect";

/**
 * Value Objects: Domain concepts with business rules
 * These represent the fundamental building blocks of the Description domain.
 */
export const DescriptionId = Schema.UUID.pipe(
  Schema.brand("DescriptionId"),
  Schema.annotations({
    jsonSchema: {
      format: "uuid",
      description: "Unique Identifier (UUID)",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  }),
);

export type DescriptionId = Schema.Schema.Type<typeof DescriptionId>;

export const DescriptionTitle = Schema.String.pipe(
  Schema.minLength(1),
  Schema.maxLength(100),
  Schema.brand("DescriptionTitle"),
);
export type DescriptionTitle = Schema.Schema.Type<typeof DescriptionTitle>;

export const DescriptionContentText = Schema.String.pipe(
  Schema.minLength(1),
  Schema.maxLength(5000),
  Schema.brand("DescriptionContentText"),
);
export type DescriptionContentText = Schema.Schema.Type<
  typeof DescriptionContentText
>;

const Base64Regex = /^[a-zA-Z0-9+/]*={0,2}$/;
export const DescriptionCursor = Schema.String.pipe(
  Schema.pattern(Base64Regex, { message: () => "Invalid base64 cursor" }),
  Schema.maxLength(128),
  Schema.brand("DescriptionCursor"),
);
export type DescriptionCursor = Schema.Schema.Type<typeof DescriptionCursor>;

export const DescriptionCategory = Schema.Literal(
  "GENERAL",
  "GAMING",
  "CHAT",
  "MUSIC",
  "EVENT",
  "COLLAB",
).pipe(Schema.brand("DescriptionCategory"));

export type DescriptionCategory = Schema.Schema.Type<
  typeof DescriptionCategory
>;

export const PAGINATION_LIMIT = 50;
