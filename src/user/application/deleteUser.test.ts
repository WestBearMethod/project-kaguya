import { describe, expect, it } from "bun:test";
import { Cause, Effect, Layer, Option, Schema } from "effect";
import { ChannelId, UserId } from "@/shared/domain/valueObjects";
import { User } from "@/user/domain/entities";
import {
  UserAlreadyDeletedError,
  UserNotFoundError,
} from "@/user/domain/errors";
import { DeleteUserCommand } from "./commands";
import { DeleteUser } from "./deleteUser";
import { DeletedUser } from "./dtos";
import { type IUserWriter, UserWriter } from "./UserRepository";

describe("DeleteUser Use Case", () => {
  const mockUserId = Schema.decodeSync(UserId)(1);
  const mockChannelId = Schema.decodeSync(ChannelId)(
    "123456789012345678901234",
  );

  const mockUser: User = Schema.decodeSync(User)({
    id: mockUserId,
    channelId: mockChannelId,
    deletedAt: null,
  });

  const setup = (mockWriter: IUserWriter) => {
    return DeleteUser.Live.pipe(
      Layer.provide(Layer.succeed(UserWriter, mockWriter)),
    );
  };

  it("should successfully delete a user", async () => {
    const mockWriter = {
      findEntityByChannelId: () => Effect.succeed(Option.some(mockUser)),
      softDelete: (user: User) =>
        Effect.succeed(
          Schema.decodeSync(DeletedUser)({
            channelId: user.channelId,
            deletedAt: new Date(),
          }),
        ),
    };

    const program = Effect.gen(function* () {
      const useCase = yield* DeleteUser;
      const command = Schema.decodeSync(DeleteUserCommand)({
        channelId: mockChannelId,
      });
      return yield* useCase.execute(command);
    }).pipe(Effect.provide(setup(mockWriter)));

    const result = await Effect.runPromise(program);
    expect(result.channelId).toBe(mockChannelId);
  });

  it("should fail if user is not found", async () => {
    const mockWriter: IUserWriter = {
      findEntityByChannelId: () => Effect.succeed(Option.none()),
      softDelete: () => Effect.fail(new Error("Should not be called")),
    };

    const program = Effect.gen(function* () {
      const useCase = yield* DeleteUser;
      const command = Schema.decodeSync(DeleteUserCommand)({
        channelId: mockChannelId,
      });
      return yield* useCase.execute(command);
    }).pipe(Effect.provide(setup(mockWriter)));

    const result = await Effect.runPromiseExit(program);
    expect(result._tag === "Failure").toBe(true);
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(Option.isSome(failure)).toBe(true);
      if (Option.isSome(failure)) {
        expect(failure.value).toBeInstanceOf(UserNotFoundError);
      }
    }
  });

  it("should fail if user is already deleted", async () => {
    const deletedUser = Schema.decodeSync(User)({
      ...mockUser,
      deletedAt: new Date(),
    });
    const mockWriter: IUserWriter = {
      findEntityByChannelId: () => Effect.succeed(Option.some(deletedUser)),
      softDelete: () => Effect.fail(new Error("Should not be called")),
    };

    const program = Effect.gen(function* () {
      const useCase = yield* DeleteUser;
      const command = Schema.decodeSync(DeleteUserCommand)({
        channelId: mockChannelId,
      });
      return yield* useCase.execute(command);
    }).pipe(Effect.provide(setup(mockWriter)));

    const result = await Effect.runPromiseExit(program);
    expect(result._tag === "Failure").toBe(true);
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(Option.isSome(failure)).toBe(true);
      if (Option.isSome(failure)) {
        expect(failure.value).toBeInstanceOf(UserAlreadyDeletedError);
      }
    }
  });
});
