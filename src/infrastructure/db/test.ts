import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Effect, Exit, Scope } from "effect";
import postgres from "postgres";
import * as schema from "@/db/schema";

export const setupTestDb = async () => {
  const dbConfig = {
    host: process.env.DB_HOST || "db",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  };

  const testDbName = `kaguya_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // --- Resource Definitions ---

  // 1. Helper to create a Postgres connection resource
  const makeSql = (dbName: string) =>
    Effect.acquireRelease(
      Effect.sync(() => postgres({ ...dbConfig, database: dbName })),
      (sql) => Effect.promise(() => sql.end()),
    );

  // 2. Effect to setup (create) and teardown (drop) the test database
  const setupDatabase = Effect.gen(function* () {
    const adminSql = yield* makeSql("postgres");

    // Create DB
    yield* Effect.promise(
      () => adminSql`CREATE DATABASE ${adminSql(testDbName)}`,
    );

    // Register Finalizer to Drop DB when scope closes
    yield* Effect.addFinalizer(() =>
      Effect.promise(
        () => adminSql`DROP DATABASE IF EXISTS ${adminSql(testDbName)}`,
      ),
    );
  });

  // --- Main Program ---

  const program = Effect.gen(function* () {
    // Execute DB Setup (Create + Register Drop Finalizer)
    yield* setupDatabase;

    // Connect to the fresh Test DB
    const client = yield* makeSql(testDbName);
    const db = drizzle(client, { schema });

    // Run Migrations
    yield* Effect.promise(() => migrate(db, { migrationsFolder: "drizzle" }));

    return db;
  });

  // --- Execution Control ---

  // Manually create a Scope to control the lifecycle from Jest/Bun
  const scope = Effect.runSync(Scope.make());

  // Run the program extending the manual scope
  const result = await Effect.runPromiseExit(program.pipe(Scope.extend(scope)));

  if (Exit.isFailure(result)) {
    // If setup fails, close scope to trigger cleanup (Drop DB)
    await Effect.runPromise(Scope.close(scope, Exit.void));
    throw new Error(`Test DB setup failed: ${result.cause}`);
  }

  return {
    db: result.value,
    teardown: () => Effect.runPromise(Scope.close(scope, Exit.void)),
  };
};
