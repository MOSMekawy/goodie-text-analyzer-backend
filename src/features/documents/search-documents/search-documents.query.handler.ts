import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchDocumentsQuery } from './search-documents.query';
import { documents, keywords, keywordsToDocuments } from '../../../persistence/schemas';
import { sql } from 'drizzle-orm';
import { ApplicationResult } from '../../../shared/application/application-result';
import { SearchDocumentsResponse } from './search-documents.response';
import { and, eq, gte, lte } from 'drizzle-orm';

@QueryHandler(SearchDocumentsQuery)
export class SearchDocumentsQueryHandler
  implements IQueryHandler<SearchDocumentsQuery>
{
  constructor(@Inject('DB_CONTEXT') private readonly db: NodePgDatabase) {}

  async execute(
    query: SearchDocumentsQuery,
  ): Promise<ApplicationResult<SearchDocumentsResponse>> {
    const conditions = [];

    if (query.fromDate) {
      conditions.push(gte(documents.createdAt, query.fromDate));
    }

    if (query.toDate) {
      conditions.push(lte(documents.createdAt, query.toDate));
    }

    const documentsQuery = this.db
      .select({
        id: documents.id,
        title: documents.title,
        content: documents.content,
        sourceId: documents.sourceId,
        externalId: documents.externalId,
        createdAt: documents.createdAt,
      })
      .from(documents);

    const countQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(documents);

    if (query.keywordId) {
      documentsQuery
        .leftJoin(
          keywordsToDocuments,
          eq(documents.id, keywordsToDocuments.documentId),
        )
        .leftJoin(keywords, eq(keywordsToDocuments.keywordId, keywords.id))
        .where(eq(keywordsToDocuments.keywordId, query.keywordId));

        countQuery
          .leftJoin(
            keywordsToDocuments,
            eq(documents.id, keywordsToDocuments.documentId),
          )
          .leftJoin(keywords, eq(keywordsToDocuments.keywordId, keywords.id))
          .where(eq(keywordsToDocuments.keywordId, query.keywordId));
    }

    if (conditions.length > 0) {
      documentsQuery.where(and(...conditions));
      countQuery.where(and(...conditions));
    }

    documentsQuery
      .limit(query.limit ?? 10)
      .offset(query.skip ?? 0);

    const [results, [{ count }]] = await Promise.all([
      documentsQuery,
      countQuery,
    ]);

    const response = new SearchDocumentsResponse();
    response.total = count;
    response.documents = results;

    return ApplicationResult.ok(response);
  }
}
