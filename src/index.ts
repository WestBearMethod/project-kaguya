import { openapi } from "@elysiajs/openapi";
import { JSONSchema } from "effect";
import { Elysia } from "elysia";
import { descriptionController } from "./infrastructure/description/description";
import { healthController } from "./infrastructure/health/health";

const app = new Elysia();

if (process.env.NODE_ENV === "development") {
  app.use(
    openapi({
      mapJsonSchema: {
        effect: JSONSchema.make,
      },
    }),
  );
}

app
  .get("/", () => "Hello Elysia")
  .use(healthController)
  .use(descriptionController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
