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

/**
 * DescriptionReader (リードモデル)
 * 参照系の責務を担う
 */
export interface IDescriptionReader {
  readonly findByChannelId: (
    query: GetDescriptionsQuery,
  ) => Effect.Effect<PaginatedDescriptionSummary, Error>;

  readonly findById: (
    query: GetDescriptionContentQuery,
  ) => Effect.Effect<Option.Option<DescriptionContent>, Error>;
}

export class DescriptionReader extends Context.Tag("DescriptionReader")<
  DescriptionReader,
  IDescriptionReader
>() {}

/**
 * DescriptionWriter (ライトモデル)
 * 更新系の責務を担う
 */
export interface IDescriptionWriter {
  readonly save: (
    command: CreateDescriptionCommand,
  ) => Effect.Effect<Description, Error>;

  readonly softDelete: (
    command: DeleteDescriptionCommand,
  ) => Effect.Effect<Description, Error>;
}

export class DescriptionWriter extends Context.Tag("DescriptionWriter")<
  DescriptionWriter,
  IDescriptionWriter
>() {}
