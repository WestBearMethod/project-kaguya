import { Effect, Exit, Layer, Schema } from "effect";
import { Elysia, t } from "elysia";
import { DeleteDescription } from "@/application/description/deleteDescription";
import { GetDescriptionContent } from "@/application/description/getDescriptionContent";
import { GetDescriptions } from "@/application/description/getDescriptions";
import { SaveDescription } from "@/application/description/saveDescription";
import {
  CreateDescription,
  Description,
  DescriptionContent,
  DescriptionContentRequest,
  DescriptionSummary,
} from "@/domain/description/Description";
import { logErrorInProduction } from "@/infrastructure/logger";
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
          return yield* useCase.execute(body);
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (cause) => {
            logErrorInProduction("POST /descriptions error:", cause);
            set.status = 500;
            return { error: "Internal Server Error" };
          },
        });
      },
      {
        body: Schema.standardSchemaV1(CreateDescription),
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
          return yield* useCase.execute(query.channelId);
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (cause) => {
            logErrorInProduction("GET /descriptions error:", cause);
            set.status = 500;
            return { error: "Internal Server Error" };
          },
        });
      },
      {
        query: t.Object({
          channelId: t.String(),
        }),
        response: {
          200: Schema.standardSchemaV1(Schema.Array(DescriptionSummary)),
          500: Schema.standardSchemaV1(ErrorSchema),
        },
      },
    )
    .get(
      "/:id/content",
      async ({ params, set }) => {
        const result = await Effect.gen(function* () {
          const useCase = yield* GetDescriptionContent;
          return yield* useCase.execute(params.id);
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (content) => {
            if (!content) {
              set.status = 404;
              return { error: "Not found" };
            }
            return content;
          },
          onFailure: (cause) => {
            logErrorInProduction("GET /descriptions/:id/content error:", cause);
            set.status = 500;
            return { error: "Internal Server Error" };
          },
        });
      },
      {
        params: Schema.standardSchemaV1(DescriptionContentRequest),
        response: {
          200: Schema.standardSchemaV1(DescriptionContent),
          404: Schema.standardSchemaV1(ErrorSchema),
          500: Schema.standardSchemaV1(ErrorSchema),
        },
      },
    )
    .delete(
      "/:id",
      async ({ params, set }) => {
        const result = await Effect.gen(function* () {
          const useCase = yield* DeleteDescription;
          return yield* useCase.execute(params.id);
        }).pipe(Effect.provide(appLayer), Effect.runPromiseExit);

        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (cause) => {
            logErrorInProduction("DELETE /descriptions/:id error:", cause);
            set.status = 500;
            return { error: "Internal Server Error" };
          },
        });
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: Schema.standardSchemaV1(Description),
          500: Schema.standardSchemaV1(ErrorSchema),
        },
      },
    );

export const descriptionController = createDescriptionController(AppLayer);
