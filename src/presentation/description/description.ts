import { Effect, Exit, type Layer, Option, Schema } from "effect";
import { Elysia } from "elysia";
import {
  CreateDescriptionCommand,
  type DeleteDescriptionCommand,
} from "@/application/description/commands";
import { DeleteDescription } from "@/application/description/deleteDescription";
import { DescriptionContent } from "@/application/description/dtos";
import { GetDescriptionContent } from "@/application/description/getDescriptionContent";
import { GetDescriptions } from "@/application/description/getDescriptions";
import {
  GetDescriptionContentQuery,
  GetDescriptionsQuery,
} from "@/application/description/queries";
import { SaveDescription } from "@/application/description/saveDescription";
import { AppLayer } from "@/application/layer";
import { Description } from "@/domain/description/entities";
import { logCauseInProduction } from "@/infrastructure/logger";
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
          const description = yield* useCase.execute(body);
          return yield* Schema.encode(Description)(description);
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
          return yield* Schema.encode(GetDescriptionsResponse)({
            items: summary.items,
            nextCursor: summary.nextCursor,
          });
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
          const description = yield* useCase.execute(command);
          return yield* Schema.encode(Description)(description);
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (cause) => {
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
          500: Schema.standardSchemaV1(ErrorSchema),
        },
      },
    );

export const descriptionController = createDescriptionController(AppLayer);
