import { Schema } from "effect";

export const ChannelId = Schema.String.pipe(Schema.length(24));

export const UserId = Schema.Number;
