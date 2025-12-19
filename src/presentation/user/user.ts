import { Cause, Effect, Exit, type Layer, Option, Schema } from "effect";
import { Elysia } from "elysia";
import { AppLayer } from "@/application/layer";
import { DeleteUser } from "@/application/user/deleteUser";
import { DeleteUserCommand } from "@/domain/user/commands";
import {
  UserAlreadyDeletedError,
  UserNotFoundError,
} from "@/domain/user/errors";
import { logCauseInProduction } from "@/infrastructure/logger";
import { DeleteUserParams } from "@/presentation/user/requests";
import { DeleteUserResponse } from "@/presentation/user/responses";
import { ErrorSchema } from "@/presentation/user/schemas";

export const createUserController = (
  appLayer: Layer.Layer<DeleteUser, never, never>,
) =>
  new Elysia({ prefix: "/users" }).delete(
    "/:channelId",
    async ({ params, set }) => {
      const result = await Effect.gen(function* () {
        const command = yield* Schema.decodeUnknown(DeleteUserCommand)(params);
        const useCase = yield* DeleteUser;
        const deleted = yield* useCase.execute(command);
        return yield* Schema.encode(DeleteUserResponse)(deleted);
      }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (cause) => {
          const error = Cause.failureOption(cause);
          if (Option.isSome(error)) {
            if (error.value instanceof UserNotFoundError) {
              set.status = 404;
              return { error: "User Not Found" };
            }
            if (error.value instanceof UserAlreadyDeletedError) {
              set.status = 409;
              return { error: "User Already Deleted" };
            }
          }

          logCauseInProduction("DELETE /users/:channelId error:", cause);
          set.status = 500;
          return { error: "Internal Server Error" };
        },
      });
    },
    {
      params: Schema.standardSchemaV1(DeleteUserParams),
      response: {
        200: Schema.standardSchemaV1(DeleteUserResponse),
        404: Schema.standardSchemaV1(ErrorSchema),
        409: Schema.standardSchemaV1(ErrorSchema),
        500: Schema.standardSchemaV1(ErrorSchema),
      },
    },
  );

export const userController = createUserController(AppLayer);
