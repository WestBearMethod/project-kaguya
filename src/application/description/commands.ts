import { Schema } from "effect";
import { Description } from "@/domain/description/entities";
import {
  DescriptionCategory,
  DescriptionId,
} from "@/domain/description/valueObjects";
import { ChannelId } from "@/domain/shared/valueObjects";

export const CreateDescriptionCommand = Description.pipe(
  Schema.omit("id", "createdAt", "deletedAt", "category"),
  Schema.extend(
    Schema.Struct({
      category: Schema.optional(Schema.NullOr(DescriptionCategory)),
    }),
  ),
);

export interface CreateDescriptionCommand
  extends Schema.Schema.Type<typeof CreateDescriptionCommand> {}

export const DeleteDescriptionCommand = Schema.Struct({
  id: DescriptionId,
  channelId: ChannelId,
});

export interface DeleteDescriptionCommand
  extends Schema.Schema.Type<typeof DeleteDescriptionCommand> {}
