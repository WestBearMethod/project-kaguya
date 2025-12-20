import { Context, type Effect, type Option } from "effect";
import type { UserDomainError } from "@/domain/user/errors";
import type { DeleteUserCommand } from "./commands";
import type { DeletedUser, UserFound } from "./dtos";
import type { GetUserByChannelIdQuery } from "./queries";

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
  readonly softDeleteWithDescriptions: (
    command: DeleteUserCommand,
  ) => Effect.Effect<DeletedUser, UserDomainError | Error>;
}

export class UserWriter extends Context.Tag("UserWriter")<
  UserWriter,
  IUserWriter
>() {}
