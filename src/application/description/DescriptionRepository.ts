import { Context, type Effect, type Option } from "effect";
import type {
  CreateDescriptionCommand,
  DeleteDescriptionCommand,
} from "@/application/description/commands";
import type {
  DescriptionContent,
  PaginatedDescriptionSummary,
} from "@/application/description/dtos";
import type {
  GetDescriptionContentQuery,
  GetDescriptionsQuery,
} from "@/application/description/queries";
import type { Description } from "@/domain/description/entities";

export interface IDescriptionRepository {
  readonly findByChannelId: (
    query: GetDescriptionsQuery,
  ) => Effect.Effect<PaginatedDescriptionSummary, Error>;

  readonly findById: (
    query: GetDescriptionContentQuery,
  ) => Effect.Effect<Option.Option<DescriptionContent>, Error>;

  readonly save: (
    command: CreateDescriptionCommand,
  ) => Effect.Effect<Description, Error>;

  readonly softDelete: (
    command: DeleteDescriptionCommand,
  ) => Effect.Effect<Description, Error>;
}

export class DescriptionRepository extends Context.Tag("DescriptionRepository")<
  DescriptionRepository,
  IDescriptionRepository
>() {}
