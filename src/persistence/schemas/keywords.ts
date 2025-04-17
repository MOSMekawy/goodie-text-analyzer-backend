import { integer, pgTable, text, primaryKey } from 'drizzle-orm/pg-core';
import { baseColumns } from './base-columns';
import { documents } from './documents';

export const keywords = pgTable('keywords', {
  ...baseColumns,
  word: text('word').notNull().unique(),
  frequency: integer('frequency').notNull(),
  positiveSentimentDocumentsCount: integer(
    'positive_sentiment_document_count',
  ).notNull(),
  neutralSentimentDocumentsCount: integer(
    'neutral_sentiment_document_count',
  ).notNull(),
  negativeSentimentDocumentsCount: integer(
    'negative_sentiment_document_count',
  ).notNull(),
});

// Junction table for many-to-many relationship between keywords and documents
export const keywordsToDocuments = pgTable(
  'keywords_to_documents',
  {
    keywordId: integer('keyword_id')
      .notNull()
      .references(() => keywords.id),
    documentId: integer('document_id')
      .notNull()
      .references(() => documents.id),
  },
  (table) => [primaryKey({ columns: [table.keywordId, table.documentId] })],
);

export type Keyword = typeof keywords.$inferSelect;
export type NewKeyword = typeof keywords.$inferInsert;
