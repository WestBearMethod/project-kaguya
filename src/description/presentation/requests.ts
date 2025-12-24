import { Schema } from "effect";
import { DescriptionId } from "@/description/domain/valueObjects";
import { ChannelId } from "@/shared/domain/valueObjects";

// HTTP Params schema for delete operation
export const DeleteDescriptionParams = Schema.Struct({
  id: DescriptionId,
});

// HTTP Body schema for delete operation
export const DeleteDescriptionBody = Schema.Struct({
  channelId: ChannelId,
});
