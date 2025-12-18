import { openapi } from "@elysiajs/openapi";
import { JSONSchema } from "effect";
import { Elysia } from "elysia";
import { descriptionController } from "@/presentation/description/description";
import { healthController } from "@/presentation/health/health";
import { userController } from "@/presentation/user/user";

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
