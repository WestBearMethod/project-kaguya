import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { descriptionController } from "./infrastructure/description/description";

const app = new Elysia();

if (process.env.NODE_ENV === "development") {
  app.use(openapi());
}

app
  .get("/", () => "Hello Elysia")
  .use(descriptionController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
