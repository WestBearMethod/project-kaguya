import { Context, Layer } from "effect";
import { type DrizzleDb, db } from "@/db";

export class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  DrizzleDb
>() {}

export const DatabaseServiceLive = Layer.succeed(DatabaseService, db);
