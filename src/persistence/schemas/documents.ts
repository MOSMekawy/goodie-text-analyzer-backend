import {
  pgTable,
  text,
  integer,
  varchar,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { baseColumns } from './base-columns';
import { sources } from './sources';

// Document entity
export const documents = pgTable(
  'documents',
  {
    ...baseColumns,
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    sourceId: integer('source_id').references(() => sources.id),
    externalId: integer('external_id').notNull(),
  },
  (table) => [uniqueIndex('external_id_idx').on(table.externalId)],
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
