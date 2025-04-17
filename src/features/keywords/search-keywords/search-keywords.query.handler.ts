import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SearchKeywordsQuery } from './search-keywords.query';
import { keywords } from '../../../persistence/schemas';
import { sql } from 'drizzle-orm';
import { ApplicationResult } from '../../../shared/application/application-result';
import { SearchKeywordsResponse } from './search-keywords.response';

export interface KeywordDto {
  id: number;
  word: string;
  frequency: number;
  positiveSentimentDocumentsCount: number;
  negativeSentimentDocumentsCount: number;
  neutralSentimentDocumentsCount: number;
  overallSentiment: 'positive' | 'negative' | 'neutral';
}

@QueryHandler(SearchKeywordsQuery)
export class SearchKeywordsQueryHandler
  implements IQueryHandler<SearchKeywordsQuery>
{
  constructor(@Inject('DB_CONTEXT') private readonly db: NodePgDatabase) {}

  async execute(
    query: SearchKeywordsQuery,
  ): Promise<ApplicationResult<SearchKeywordsResponse>> {
    // Build the base query
    const keywordsQuery = this.db
      .select({
        id: keywords.id,
        word: keywords.word,
        frequency: keywords.frequency,
        positiveMentions: keywords.positiveSentimentDocumentsCount,
        negativeMentions: keywords.negativeSentimentDocumentsCount,
        neutralMentions: keywords.neutralSentimentDocumentsCount,
      })
      .from(keywords);

    // Add search filter if provided
    if (query.search) {
      keywordsQuery.where(sql`${keywords.word} ILIKE ${`%${query.search}%`}`);
    }

    keywordsQuery.limit(query.limit).offset(query.skip);

    const countQuery = this.db.select({ total: sql`count(*)` })
      .from(keywords)
      .where(sql`${keywords.word} ILIKE ${`%${query.search}%`}`);

    const [resultingKeywords, totalCount] = await Promise.all([
      keywordsQuery,
      countQuery,
    ]);

    const response = new SearchKeywordsResponse();
    response.total = (totalCount?.at(0)?.total ?? 0) as any;
    response.keywords = resultingKeywords;

    return ApplicationResult.ok(response);
  }
}
