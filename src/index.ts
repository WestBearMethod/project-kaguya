import { openapi } from "@elysiajs/openapi";
import { JSONSchema } from "effect";
import { Elysia } from "elysia";
import { descriptionController } from "@/description/presentation/controller";
import { healthController } from "@/health/controller";
import { userController } from "@/user/presentation/controller";

const app = new Elysia();

const isDevelopment = process.env.NODE_ENV === "development";

if (isDevelopment) {
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
  .use(userController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}${isDevelopment ? "/openapi" : ""}`,
);
