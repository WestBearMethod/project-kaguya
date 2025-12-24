import { Schema } from "effect";

export const ChannelId = Schema.String.pipe(
  Schema.length(24),
  Schema.brand("ChannelId"),
);
export type ChannelId = Schema.Schema.Type<typeof ChannelId>;

export const UserId = Schema.Number.pipe(Schema.brand("UserId"));
export type UserId = Schema.Schema.Type<typeof UserId>;
