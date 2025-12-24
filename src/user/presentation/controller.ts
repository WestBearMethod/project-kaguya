import { Cause, Effect, Exit, type Layer, Option, Schema } from "effect";
import { Elysia } from "elysia";
import { AppLayer } from "@/shared/application/layer";
import { ErrorMessage } from "@/shared/domain/primitives";
import { logCauseInProduction } from "@/shared/logger";
import { ErrorSchema } from "@/shared/presentation/schemas";
import { DeleteUserCommand } from "@/user/application/commands";
import { DeleteUser } from "@/user/application/deleteUser";
import {
  UserAlreadyDeletedError,
  UserNotFoundError,
} from "@/user/domain/errors";
import { DeleteUserParams } from "@/user/presentation/requests";
import { DeleteUserResponse } from "@/user/presentation/responses";

export const createUserController = (
  appLayer: Layer.Layer<DeleteUser, never, never>,
) =>
  new Elysia({ prefix: "/users" }).delete(
    "/:channelId",
    async ({ params, set }) => {
      const result = await Effect.gen(function* () {
        const command = yield* Schema.decodeUnknown(DeleteUserCommand)(params);
        const useCase = yield* DeleteUser;
        return yield* useCase.execute(command);
      }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

      return Exit.match(result, {
        onSuccess: (value) => Schema.decodeSync(DeleteUserResponse)(value),
        onFailure: (cause) => {
          const error = Cause.failureOption(cause);
          if (Option.isSome(error)) {
            if (error.value instanceof UserNotFoundError) {
              set.status = 404;
              return Schema.decodeSync(ErrorSchema)({
                error: Schema.decodeSync(ErrorMessage)("User Not Found"),
              });
            }
            if (error.value instanceof UserAlreadyDeletedError) {
              set.status = 409;
              return Schema.decodeSync(ErrorSchema)({
                error: Schema.decodeSync(ErrorMessage)("User Already Deleted"),
              });
            }
          }

          logCauseInProduction("DELETE /users/:channelId error:", cause);
          set.status = 500;
          return Schema.decodeSync(ErrorSchema)({
            error: Schema.decodeSync(ErrorMessage)("Internal Server Error"),
          });
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
