import { Schema } from "effect";
import { ChannelId, DescriptionId } from "@/domain/description/valueObjects";

// HTTP Params schema for delete operation
export const DeleteDescriptionParams = Schema.Struct({
  id: DescriptionId,
});

// HTTP Body schema for delete operation
export const DeleteDescriptionBody = Schema.Struct({
  channelId: ChannelId,
});
