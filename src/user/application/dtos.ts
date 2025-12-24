import { type Brand, Schema } from "effect";
import { AnnotatedDateFromSelf } from "@/shared/domain/primitives";
import { ChannelId } from "@/shared/domain/valueObjects";
import { UserStruct } from "@/user/domain/entities";

export const UserFound = UserStruct.pipe(Schema.brand("UserFound"));

export interface UserFound
  extends Schema.Schema.Type<typeof UserFound>,
    Brand.Brand<"UserFound"> {}

export const DeletedUser = Schema.Struct({
  channelId: ChannelId,
  deletedAt: AnnotatedDateFromSelf,
}).pipe(Schema.brand("DeletedUser"));

export interface DeletedUser
  extends Schema.Schema.Type<typeof DeletedUser>,
    Brand.Brand<"DeletedUser"> {}
