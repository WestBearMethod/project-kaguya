import { Context, type Effect } from "effect";
import type { CreateDescription, Description } from "./Description";

export interface IDescriptionRepository {
  readonly save: (
    description: CreateDescription,
  ) => Effect.Effect<Description, Error>;

  readonly findByChannelId: (
    channelId: string,
  ) => Effect.Effect<Description[], Error>;
}

export class DescriptionRepository extends Context.Tag("DescriptionRepository")<
  DescriptionRepository,
  IDescriptionRepository
>() {}
