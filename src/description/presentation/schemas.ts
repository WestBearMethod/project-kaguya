import { Schema } from "effect";

export const ErrorSchema = Schema.Struct({
  error: Schema.String,
});
