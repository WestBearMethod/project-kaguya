import { Cause, Effect, Exit, type Layer, Option, Schema } from "effect";
import { Elysia } from "elysia";
import {
  CreateDescriptionCommand,
  type DeleteDescriptionCommand,
} from "@/description/application/commands";
import { DeleteDescription } from "@/description/application/deleteDescription";
import { DescriptionContent } from "@/description/application/dtos";
import { GetDescriptionContent } from "@/description/application/getDescriptionContent";
import { GetDescriptions } from "@/description/application/getDescriptions";
import {
  GetDescriptionContentQuery,
  GetDescriptionsQuery,
} from "@/description/application/queries";
import { SaveDescription } from "@/description/application/saveDescription";
import { Description } from "@/description/domain/entities";
import {
  DescriptionAlreadyDeletedError,
  DescriptionNotFoundError,
  PermissionDeniedError,
} from "@/description/domain/errors";
import { AppLayer } from "@/shared/application/layer";
import { logCauseInProduction } from "@/shared/logger";
import { DeleteDescriptionBody, DeleteDescriptionParams } from "./requests";
import { GetDescriptionsResponse } from "./responses";
import { ErrorSchema } from "./schemas";

export const createDescriptionController = (
  appLayer: Layer.Layer<
    | SaveDescription
    | GetDescriptions
    | GetDescriptionContent
    | DeleteDescription,
    never,
    never
  >,
) =>
  new Elysia({ prefix: "/descriptions" })
    .post(
      "/",
      async ({ body, set }) => {
        const result = await Effect.gen(function* () {
          const useCase = yield* SaveDescription;
          return yield* useCase.execute(body);
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (cause) => {
            logCauseInProduction("POST /descriptions error:", cause);
            set.status = 500;
            return { error: "Internal Server Error" };
          },
        });
      },
      {
        body: Schema.standardSchemaV1(CreateDescriptionCommand),
        response: {
          200: Schema.standardSchemaV1(Description),
          500: Schema.standardSchemaV1(ErrorSchema),
        },
      },
    )
    .get(
      "/",
      async ({ query, set }) => {
        const result = await Effect.gen(function* () {
          const useCase = yield* GetDescriptions;
          const summary = yield* useCase.execute(query);
          return {
            items: summary.items,
            nextCursor: summary.nextCursor,
          };
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (cause) => {
            logCauseInProduction("GET /descriptions error:", cause);
            set.status = 500;
            return { error: "Internal Server Error" };
          },
        });
      },
      {
        query: Schema.standardSchemaV1(GetDescriptionsQuery),
        response: {
          200: Schema.standardSchemaV1(GetDescriptionsResponse),
          500: Schema.standardSchemaV1(ErrorSchema),
        },
      },
    )
    .get(
      "/:id/content",
      async ({ params, set }) => {
        const result = await Effect.gen(function* () {
          const useCase = yield* GetDescriptionContent;
          const optionContent = yield* useCase.execute(params);

          return yield* Option.match(optionContent, {
            onNone: () => Effect.succeed(Option.none()),
            onSome: (content) =>
              Schema.encode(DescriptionContent)(content).pipe(
                Effect.map(Option.some),
              ),
          });
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (optionContent) =>
            Option.match(optionContent, {
              onSome: (content) => content,
              onNone: () => {
                set.status = 404;
                return { error: "Not found" };
              },
            }),
          onFailure: (cause) => {
            logCauseInProduction("GET /descriptions/:id/content error:", cause);
            set.status = 500;
            return { error: "Internal Server Error" };
          },
        });
      },
      {
        params: Schema.standardSchemaV1(GetDescriptionContentQuery),
        response: {
          200: Schema.standardSchemaV1(DescriptionContent),
          404: Schema.standardSchemaV1(ErrorSchema),
          500: Schema.standardSchemaV1(ErrorSchema),
        },
      },
    )
    .delete(
      "/:id",
      async ({ params, body, set }) => {
        const result = await Effect.gen(function* () {
          const useCase = yield* DeleteDescription;
          const command: DeleteDescriptionCommand = {
            id: params.id,
            channelId: body.channelId,
          };
          return yield* useCase.execute(command);
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (cause) => {
            const failure = Cause.failureOption(cause);
            if (Option.isSome(failure)) {
              const error = failure.value;
              if (error instanceof DescriptionNotFoundError) {
                set.status = 404;
                return { error: "Description not found" };
              }
              if (error instanceof PermissionDeniedError) {
                set.status = 403;
                return { error: "Permission denied" };
              }
              if (error instanceof DescriptionAlreadyDeletedError) {
                set.status = 409;
                return { error: "Description already deleted" };
              }
            }

            logCauseInProduction("DELETE /descriptions/:id error:", cause);
            set.status = 500;
            return { error: "Internal Server Error" };
          },
        });
      },
      {
        params: Schema.standardSchemaV1(DeleteDescriptionParams),
        body: Schema.standardSchemaV1(DeleteDescriptionBody),
        response: {
          200: Schema.standardSchemaV1(Description),
          403: Schema.standardSchemaV1(ErrorSchema),
          404: Schema.standardSchemaV1(ErrorSchema),
          409: Schema.standardSchemaV1(ErrorSchema),
          500: Schema.standardSchemaV1(ErrorSchema),
        },
      },
    );

export const descriptionController = createDescriptionController(AppLayer);
