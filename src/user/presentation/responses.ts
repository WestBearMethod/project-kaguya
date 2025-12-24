import { type Brand, Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/shared/domain/primitives";
import { ChannelId } from "@/shared/domain/valueObjects";

export const DeleteUserResponse = Schema.Struct({
  channelId: ChannelId,
  deletedAt: AnnotatedDateFromSelf,
}).pipe(Schema.brand("DeleteUserResponse"));

export interface DeleteUserResponse
  extends Schema.Schema.Type<typeof DeleteUserResponse>,
    Brand.Brand<"DeleteUserResponse"> {}
