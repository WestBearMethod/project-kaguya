import { Context, type Effect, type Option } from "effect";
import type { ChannelId } from "@/shared/domain/valueObjects";
import type { DeletedUser, UserFound } from "@/user/application/dtos";
import type { GetUserByChannelIdQuery } from "@/user/application/queries";
import type { User } from "@/user/domain/entities";
import type { UserDomainError } from "@/user/domain/errors";

/**
 * UserReader (リードモデル)
 */
export interface IUserReader {
  readonly findByChannelId: (
    query: GetUserByChannelIdQuery,
  ) => Effect.Effect<Option.Option<UserFound>, Error>;
}

export class UserReader extends Context.Tag("UserReader")<
  UserReader,
  IUserReader
>() {}

/**
 * UserWriter (ライトモデル)
 */
export interface IUserWriter {
  /**
   * 更新・削除操作のために Entity を取得する
   */
  readonly findEntityByChannelId: (
    channelId: typeof ChannelId.Type,
  ) => Effect.Effect<Option.Option<User>, Error>;

  /**
   * 論理削除
   */
  readonly softDelete: (
    user: User,
  ) => Effect.Effect<DeletedUser, UserDomainError | Error>;
}

export class UserWriter extends Context.Tag("UserWriter")<
  UserWriter,
  IUserWriter
>() {}
