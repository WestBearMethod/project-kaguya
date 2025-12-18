import { Schema } from "effect";

export const ErrorSchema = Schema.Struct({
  error: Schema.String,
});

export type ErrorSchema = Schema.Schema.Type<typeof ErrorSchema>;
