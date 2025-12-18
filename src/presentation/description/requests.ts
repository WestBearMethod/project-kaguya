import { Schema } from "effect";
import { DescriptionId } from "@/domain/description/valueObjects";
import { ChannelId } from "@/domain/shared/valueObjects";

// HTTP Params schema for delete operation
export const DeleteDescriptionParams = Schema.Struct({
  id: DescriptionId,
});

// HTTP Body schema for delete operation
export const DeleteDescriptionBody = Schema.Struct({
  channelId: ChannelId,
});
