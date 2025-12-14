import { Schema } from "effect";
import { Description } from "./entities";
import { ChannelId, DescriptionCategory, DescriptionId } from "./valueObjects";

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
