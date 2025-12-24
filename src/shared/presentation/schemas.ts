import { type Brand, Schema } from "effect";
import { ErrorMessage } from "@/shared/domain/primitives";

export const ErrorSchema = Schema.Struct({
  error: ErrorMessage,
}).pipe(Schema.brand("ErrorSchema"));

export interface ErrorSchema
  extends Schema.Schema.Type<typeof ErrorSchema>,
    Brand.Brand<"ErrorSchema"> {}
