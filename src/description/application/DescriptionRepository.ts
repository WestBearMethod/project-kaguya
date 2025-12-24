import { Context, type Effect, type Option } from "effect";
import type {
  DescriptionContent,
  PaginatedDescriptionSummary,
} from "@/description/application/dtos";
import type {
  GetDescriptionContentQuery,
  GetDescriptionsQuery,
} from "@/description/application/queries";
import type {
  Description,
  DescriptionDraft,
} from "@/description/domain/entities";
import type { DescriptionDomainError } from "@/description/domain/errors";
import type { DescriptionId } from "@/description/domain/valueObjects";

/**
 * DescriptionReader (リードモデル/UI向け)
 */
export interface IDescriptionReader {
  readonly findByChannelId: (
    query: GetDescriptionsQuery,
  ) => Effect.Effect<PaginatedDescriptionSummary, Error>;

  /**
   * UI向けのコンテンツ取得（DTO）
   */
  readonly findContentById: (
    query: GetDescriptionContentQuery,
  ) => Effect.Effect<Option.Option<DescriptionContent>, Error>;
}

export class DescriptionReader extends Context.Tag("DescriptionReader")<
  DescriptionReader,
  IDescriptionReader
>() {}

/**
 * DescriptionWriter (ライトモデル/ドメイン整合性向け)
 */
export interface IDescriptionWriter {
  /**
   * 新規作成
   */
  readonly create: (
    draft: DescriptionDraft,
  ) => Effect.Effect<Description, Error>;

  /**
   * 既存 Entity の更新
   */
  readonly update: (entity: Description) => Effect.Effect<Description, Error>;

  /**
   * 論理削除
   */
  readonly softDelete: (
    entity: Description,
  ) => Effect.Effect<Description, DescriptionDomainError | Error>;

  /**
   * 操作（更新・論理削除）のために ID で Entity を取得する
   */
  readonly findEntityById: (
    id: DescriptionId,
  ) => Effect.Effect<Option.Option<Description>, Error>;
}

export class DescriptionWriter extends Context.Tag("DescriptionWriter")<
  DescriptionWriter,
  IDescriptionWriter
>() {}
