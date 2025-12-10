import { Effect, Exit, Layer, Schema } from "effect";
import { Elysia, t } from "elysia";
import { GetDescriptions } from "@/application/description/getDescriptions";
import { SaveDescription } from "@/application/description/saveDescription";
import {
  CreateDescription,
  Description,
} from "@/domain/description/Description";
import { DescriptionRepositoryLive } from "./DescriptionRepository.live";

// Compose the full application layer
// UseCases depend on Repository.
export const AppLayer = Layer.mergeAll(
  SaveDescription.Live,
  GetDescriptions.Live,
).pipe(Layer.provide(DescriptionRepositoryLive));

const ErrorSchema = Schema.Struct({
  error: Schema.String,
  details: Schema.String,
});

export const descriptionController = new Elysia({ prefix: "/descriptions" })
  .post(
    "/",
    async ({ body, set }) => {
      const result = await Effect.gen(function* () {
        const useCase = yield* SaveDescription;
        return yield* useCase.execute(body);
      }).pipe(Effect.provide(AppLayer), Effect.runPromiseExit);

      if (Exit.isSuccess(result)) {
        return result.value;
      } else {
        const cause = result.cause;
        set.status = 500;
        return { error: "Internal Server Error", details: String(cause) };
      }
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
      }).pipe(Effect.provide(AppLayer), Effect.runPromiseExit);

      if (Exit.isSuccess(result)) {
        return result.value;
      } else {
        set.status = 500;
        return {
          error: "Internal Server Error",
          details: String(result.cause),
        };
      }
    },
    {
      query: t.Object({
        channelId: t.String(),
      }),
      response: {
        200: Schema.standardSchemaV1(Schema.Array(Description)),
        500: Schema.standardSchemaV1(ErrorSchema),
      },
    },
  );
