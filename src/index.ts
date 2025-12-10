import { openapi } from "@elysiajs/openapi";
import { sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "./db";

const app = new Elysia();

if (process.env.NODE_ENV === "development") {
  app.use(openapi());
}

app
  .get("/", () => "Hello Elysia")
  .get("/health", async () => {
    try {
      await db.execute(sql`SELECT 1`);
      return { status: "ok", database: "connected" };
    } catch (e) {
      return { status: "error", database: "disconnected", error: String(e) };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
