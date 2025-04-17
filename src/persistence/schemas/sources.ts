import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from './base-columns';

// Source entity
export const sources = pgTable('sources', {
  ...baseColumns,
  name: varchar('name', { length: 255 }).notNull(),
},
  (table) => [table.name]
);

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
