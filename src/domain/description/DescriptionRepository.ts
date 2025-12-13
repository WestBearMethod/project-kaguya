import { Context, type Effect, Schema } from "effect";
import type {
  CreateDescriptionCommand,
  DescriptionContent,
  DescriptionSummary,
} from "./dtos";
import type { Description } from "./entities";
import { ChannelId, DescriptionId } from "./valueObjects";

// CQRS Pattern: Query for retrieving descriptions
export const GetDescriptionsQuery = Schema.Struct({
  channelId: ChannelId,
});

export interface GetDescriptionsQuery
  extends Schema.Schema.Type<typeof GetDescriptionsQuery> {}

// CQRS Pattern: Query for retrieving description content
export const GetDescriptionContentQuery = Schema.Struct({
  id: DescriptionId,
});

export interface GetDescriptionContentQuery
  extends Schema.Schema.Type<typeof GetDescriptionContentQuery> {}

// CQRS Pattern: Command for deleting a description
export const DeleteDescriptionCommand = Schema.Struct({
  id: DescriptionId,
  channelId: ChannelId,
});

export interface DeleteDescriptionCommand
  extends Schema.Schema.Type<typeof DeleteDescriptionCommand> {}

export const DeleteDescriptionParams = Schema.Struct({
  id: DescriptionId,
});

export interface DeleteDescriptionParams
  extends Schema.Schema.Type<typeof DeleteDescriptionParams> {}

// HTTP Body schema for delete operation (excludes id which comes from params)
export const DeleteDescriptionBody = Schema.Struct({
  channelId: ChannelId,
});

export interface DeleteDescriptionBody
  extends Schema.Schema.Type<typeof DeleteDescriptionBody> {}

export interface IDescriptionRepository {
  readonly save: (
    command: CreateDescriptionCommand,
  ) => Effect.Effect<Description, Error>;

  readonly findByChannelId: (
    query: GetDescriptionsQuery,
  ) => Effect.Effect<DescriptionSummary[], Error>;

  readonly findById: (
    query: GetDescriptionContentQuery,
  ) => Effect.Effect<DescriptionContent | null, Error>;

  readonly softDelete: (
    command: DeleteDescriptionCommand,
  ) => Effect.Effect<Description, Error>;
}

export class DescriptionRepository extends Context.Tag("DescriptionRepository")<
  DescriptionRepository,
  IDescriptionRepository
>() {}
