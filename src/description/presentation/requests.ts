import { type Brand, Schema } from "effect";
import { DescriptionId } from "@/description/domain/valueObjects";
import { ChannelId } from "@/shared/domain/valueObjects";

// HTTP Params schema for delete operation
export const DeleteDescriptionParams = Schema.Struct({
  id: DescriptionId,
}).pipe(Schema.brand("DeleteDescriptionParams"));

export interface DeleteDescriptionParams
  extends Schema.Schema.Type<typeof DeleteDescriptionParams>,
    Brand.Brand<"DeleteDescriptionParams"> {}

// HTTP Body schema for delete operation
export const DeleteDescriptionBody = Schema.Struct({
  channelId: ChannelId,
}).pipe(Schema.brand("DeleteDescriptionBody"));

export interface DeleteDescriptionBody
  extends Schema.Schema.Type<typeof DeleteDescriptionBody>,
    Brand.Brand<"DeleteDescriptionBody"> {}
