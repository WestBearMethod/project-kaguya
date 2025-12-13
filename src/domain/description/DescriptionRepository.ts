import { type Chunk, Context, type Effect, type Option } from "effect";
import type {
  CreateDescriptionCommand,
  DeleteDescriptionCommand,
} from "./commands";
import type { DescriptionContent, DescriptionSummary } from "./dtos";
import type { Description } from "./entities";
import type {
  GetDescriptionContentQuery,
  GetDescriptionsQuery,
} from "./queries";

export interface IDescriptionRepository {
  readonly save: (
    command: CreateDescriptionCommand,
  ) => Effect.Effect<Description, Error>;

  readonly findByChannelId: (
    query: GetDescriptionsQuery,
  ) => Effect.Effect<Chunk.Chunk<DescriptionSummary>, Error>;

  readonly findById: (
    query: GetDescriptionContentQuery,
  ) => Effect.Effect<Option.Option<DescriptionContent>, Error>;

  readonly softDelete: (
    command: DeleteDescriptionCommand,
  ) => Effect.Effect<Description, Error>;
}

export class DescriptionRepository extends Context.Tag("DescriptionRepository")<
  DescriptionRepository,
  IDescriptionRepository
>() {}
