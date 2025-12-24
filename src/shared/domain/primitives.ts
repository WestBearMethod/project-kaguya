import { Schema } from "effect";

/**
 * A standard Date schema annotated with simplistic JSON schema metadata.
 * Useful for consistent OpenAPI documentation generation.
 */
export const AnnotatedDateFromSelf = Schema.DateFromSelf.pipe(
  Schema.annotations({
    jsonSchema: {
      type: "string",
      format: "date-time", // Indicates ISO 8601 format
    },
  }),
  Schema.brand("AnnotatedDateFromSelf"),
);

export type AnnotatedDateFromSelf = Schema.Schema.Type<
  typeof AnnotatedDateFromSelf
>;
