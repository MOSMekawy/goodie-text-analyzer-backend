import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetKeywordByIdQuery } from './get-keyword-by-id.query';
import { GetKeywordByIdResponse } from './get-keyword-by-id.response';
import { ApplicationResult } from '../../../shared/application/application-result';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { keywords } from '../../../persistence/schemas';
import { eq } from 'drizzle-orm';

@QueryHandler(GetKeywordByIdQuery)
export class GetKeywordByIdQueryHandler
  implements IQueryHandler<GetKeywordByIdQuery>
{
  constructor(@Inject('DB_CONTEXT') private readonly db: NodePgDatabase) {}

  async execute(
    query: GetKeywordByIdQuery,
  ): Promise<ApplicationResult<GetKeywordByIdResponse>> {
    const keyword = (
        await this.db
        .select({
            id: keywords.id,
            word: keywords.word,
            frequency: keywords.frequency,
            positiveMentions: keywords.positiveSentimentDocumentsCount,
            negativeMentions: keywords.negativeSentimentDocumentsCount,
            neutralMentions: keywords.neutralSentimentDocumentsCount,
        })
        .from(keywords)
        .where(eq(keywords.id, query.id))
        .limit(1)
    )?.at(0);

    if (!keyword) {
      return ApplicationResult.notFound(`Keyword with ID ${query.id} not found`);
    }

    return ApplicationResult.ok(keyword);
  }
}
