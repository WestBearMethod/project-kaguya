import { Chunk, Effect, Exit, Layer, Option, Schema } from "effect";
import { Elysia } from "elysia";
import { DeleteDescription } from "@/application/description/deleteDescription";
import { GetDescriptionContent } from "@/application/description/getDescriptionContent";
import { GetDescriptions } from "@/application/description/getDescriptions";
import { SaveDescription } from "@/application/description/saveDescription";
import {
  CreateDescriptionCommand,
  type DeleteDescriptionCommand,
} from "@/domain/description/commands";
import { DescriptionContent } from "@/domain/description/dtos";
import { Description } from "@/domain/description/entities";
import {
  GetDescriptionContentQuery,
  GetDescriptionsQuery,
} from "@/domain/description/queries";
import {
  DeleteDescriptionBody,
  DeleteDescriptionParams,
} from "@/infrastructure/description/requests";
import { GetDescriptionsResponse } from "@/infrastructure/description/responses";
import {
  logCauseInProduction,
  logErrorInProduction,
} from "@/infrastructure/logger";
import { DescriptionRepositoryLive } from "./DescriptionRepository.live";

// Compose the full application layer
// UseCases depend on Repository.
export const AppLayer = Layer.mergeAll(
  SaveDescription.Live,
  GetDescriptions.Live,
  GetDescriptionContent.Live,
  DeleteDescription.Live,
).pipe(Layer.provide(DescriptionRepositoryLive));

export const ErrorSchema = Schema.Struct({
  error: Schema.String,
});

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
            items: Chunk.toReadonlyArray(summary.items),
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
          return yield* useCase.execute(params);
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (optionContent) =>
            Option.match(optionContent, {
              onSome: (content) => {
                try {
                  return Effect.runSync(
                    Schema.encode(DescriptionContent)(content),
                  );
                } catch (error) {
                  logErrorInProduction("Encode error:", error);
                  set.status = 500;
                  return { error: "Internal Server Error" };
                }
              },
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
