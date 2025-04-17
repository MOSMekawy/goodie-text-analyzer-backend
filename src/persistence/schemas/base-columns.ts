import { serial, timestamp } from 'drizzle-orm/pg-core';

// Base columns that will be used in all tables
export const baseColumns = {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};
