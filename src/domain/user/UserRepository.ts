import { Context, type Effect, type Option } from "effect";
import type { DeleteUserCommand } from "@/domain/user/commands";
import type { DeletedUser, UserFound } from "./dtos";
import type { GetUserByChannelIdQuery } from "./queries";

export interface IUserRepository {
  readonly findByChannelId: (
    query: GetUserByChannelIdQuery,
  ) => Effect.Effect<Option.Option<UserFound>, Error>;

  readonly softDeleteWithDescriptions: (
    command: DeleteUserCommand,
  ) => Effect.Effect<DeletedUser, Error>;
}

export class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  IUserRepository
>() {}
