import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  channelId: varchar("channel_id", { length: 24 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const descriptions = pgTable(
  "descriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    channelId: varchar("channel_id", { length: 24 })
      .notNull()
      .references(() => users.channelId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => [index("channel_id_idx").on(table.channelId)],
);

// Relations definition
export const usersRelations = relations(users, ({ many }) => ({
  descriptions: many(descriptions),
}));

export const descriptionsRelations = relations(descriptions, ({ one }) => ({
  user: one(users, {
    fields: [descriptions.channelId],
    references: [users.channelId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Description = typeof descriptions.$inferSelect;
export type NewDescription = typeof descriptions.$inferInsert;
