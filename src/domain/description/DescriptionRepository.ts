import { Context, type Effect, Schema } from "effect";
import type { DescriptionContent, DescriptionSummary } from "./dtos";
import { Description } from "./entities";
import { ChannelId, DescriptionId } from "./valueObjects";

// CQRS Pattern: Command for creating a description
// Derived from Description entity by omitting server-generated fields
export const CreateDescriptionCommand = Description.pipe(
  Schema.omit("id", "createdAt", "deletedAt"),
);

export interface CreateDescriptionCommand
  extends Schema.Schema.Type<typeof CreateDescriptionCommand> {}

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
