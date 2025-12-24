import { type Brand, Schema } from "effect";
import { DescriptionStruct } from "@/description/domain/entities";
import {
  DescriptionCategory,
  DescriptionId,
} from "@/description/domain/valueObjects";
import { ChannelId } from "@/shared/domain/valueObjects";

export const CreateDescriptionCommand = DescriptionStruct.pipe(
  Schema.omit("id", "createdAt", "deletedAt", "category"),
  Schema.extend(
    Schema.Struct({
      category: Schema.optional(Schema.NullOr(DescriptionCategory)),
    }),
  ),
  Schema.brand("CreateDescriptionCommand"),
);

export interface CreateDescriptionCommand
  extends Schema.Schema.Type<typeof CreateDescriptionCommand>,
    Brand.Brand<"CreateDescriptionCommand"> {}

export const DeleteDescriptionCommand = Schema.Struct({
  id: DescriptionId,
  channelId: ChannelId,
}).pipe(Schema.brand("DeleteDescriptionCommand"));

export interface DeleteDescriptionCommand
  extends Schema.Schema.Type<typeof DeleteDescriptionCommand>,
    Brand.Brand<"DeleteDescriptionCommand"> {}
