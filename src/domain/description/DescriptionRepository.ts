import { Context, type Effect } from "effect";
import type {
  CreateDescription,
  Description,
  DescriptionContent,
  DescriptionSummary,
} from "./Description";

export interface IDescriptionRepository {
  readonly save: (
    description: CreateDescription,
  ) => Effect.Effect<Description, Error>;

  readonly findByChannelId: (
    channelId: string,
  ) => Effect.Effect<DescriptionSummary[], Error>;

  readonly findById: (
    id: string,
  ) => Effect.Effect<DescriptionContent | null, Error>;

  readonly softDelete: (id: string) => Effect.Effect<Description, Error>;
}

export class DescriptionRepository extends Context.Tag("DescriptionRepository")<
  DescriptionRepository,
  IDescriptionRepository
>() {}
