import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "@/db/schema";

export const setupTestDb = async () => {
  const dbConfig = {
    host: process.env.DB_HOST || "db",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  };

  // Generate unique DB name for parallel testing
  const testDbName = `kaguya_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // 1. Connect to default 'postgres' database to manage databases
  const adminSql = postgres({
    ...dbConfig,
    database: "postgres",
  });

  await adminSql`CREATE DATABASE ${adminSql(testDbName)}`;
  await adminSql.end();

  // 2. Connect to the test database
  const client = postgres({
    ...dbConfig,
    database: testDbName,
  });

  const db = drizzle(client, { schema });

  // 3. Run migrations
  await migrate(db, { migrationsFolder: "drizzle" });

  const teardown = async () => {
    await client.end();
    // Reconnect as admin to drop
    const adminDrop = postgres({
      ...dbConfig,
      database: "postgres",
    });
    await adminDrop`DROP DATABASE IF EXISTS ${adminDrop(testDbName)}`;
    await adminDrop.end();
  };

  return { db, teardown };
};
