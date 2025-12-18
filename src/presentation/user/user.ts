import { Effect, Exit, type Layer, Schema } from "effect";
import { Elysia } from "elysia";
import { AppLayer } from "@/application/layer";
import { DeleteUser } from "@/application/user/deleteUser";
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
        const useCase = yield* DeleteUser;
        const deleted = yield* useCase.execute(params);
        return yield* Schema.encode(DeleteUserResponse)(deleted);
      }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (cause) => {
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
        500: Schema.standardSchemaV1(ErrorSchema),
      },
    },
  );

export const userController = createUserController(AppLayer);
