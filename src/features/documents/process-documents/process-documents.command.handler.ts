import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ProcessDocumentsCommand } from './process-documents.command';
import { IPostService } from '../../../domain/contracts/post-service/post-service.interface';
import { ITextAnalysisService } from '../../../domain/contracts/text-analysis/text-analysis-service.interface';
import { ApplicationResult } from '../../../shared/application/application-result';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Document } from '../../../domain/entities/document.entity';
import { documents, keywords, keywordsToDocuments, sources } from '../../../persistence/schemas';
import { DocumentMapper } from '../../../persistence/mappers/document.mapper';
import { eq, sql } from 'drizzle-orm';

type KeywordAggregatedAnalysis = {
  word: string;
  frequency: number;
  positiveSentimentCount: number;
  negativeSentimentCount: number;
  neutralSentimentCount: number;
};

@CommandHandler(ProcessDocumentsCommand)
export class ProcessDocumentsCommandHandler
  implements ICommandHandler<ProcessDocumentsCommand> {

  constructor(
    @Inject('IPostService') private readonly postService: IPostService,
    @Inject('DB_CONTEXT') private readonly db: NodePgDatabase,
    @Inject('ITextAnalysisService')
    private readonly textAnalysisService: ITextAnalysisService,
  ) { }

  async execute(command: ProcessDocumentsCommand): Promise<ApplicationResult> {
    const postPromises = command.ids.map((id) =>
      this.postService.getPostById(id),
    );
    const postResponses = await Promise.all(postPromises);

    if (postResponses.some((res) => !res.success))
      return ApplicationResult.internalServerError('Failed to fetch posts.');

    const syncedDocuments = postResponses
      .map((p) => p.data)
      .map((p) => new Document(p.title, p.text, command.sourceId, p.id));

    // Get all existing keywords from the database
    const existingKeywords = await this.db.select().from(keywords);

    const analysisResults = syncedDocuments
      .map((document) => {
        const text = `${document.title} ${document.content}`;

        const analysisResult = this.textAnalysisService.analyzeText(
          existingKeywords.map((keyword) => keyword.word),
          text,
        );

        const filteredAnalysisResult = analysisResult.filter(
          (word) => word.frequency > 0,
        );

        return { analysisResult: filteredAnalysisResult, document };
      });

    const aggregatedAnalysisResult = analysisResults
      .flatMap((result) => result.analysisResult)
      .reduce((acc, curr) => {
        const keywordAnalysis = acc.get(curr.word);
        if (keywordAnalysis) {
          acc.set(curr.word, {
            word: curr.word,
            frequency: keywordAnalysis.frequency + curr.frequency,
            positiveSentimentCount:
              keywordAnalysis.positiveSentimentCount + curr.sentimentScore > 0
                ? 1
                : 0,
            negativeSentimentCount:
              keywordAnalysis.negativeSentimentCount + curr.sentimentScore < 0
                ? 1
                : 0,
            neutralSentimentCount:
              keywordAnalysis.neutralSentimentCount + curr.sentimentScore === 0
                ? 1
                : 0,
          });
        } else {
          acc.set(curr.word, {
            word: curr.word,
            frequency: curr.frequency,
            positiveSentimentCount: curr.sentimentScore > 0 ? 1 : 0,
            negativeSentimentCount: curr.sentimentScore < 0 ? 1 : 0,
            neutralSentimentCount: curr.sentimentScore === 0 ? 1 : 0,
          });
        }

        return acc;
      }, new Map<string, KeywordAggregatedAnalysis>());

    await this.db.transaction(async (tx) => {
      const insertedDocuments = await tx.insert(documents)
        .values(syncedDocuments.map((doc) => DocumentMapper.toPersistence(doc)))
        .onConflictDoNothing()
        .returning();

      const keywordToIdMap = new Map<string, number>(existingKeywords.map(k => [k.word, k.id]));
      const documentToIdMap = new Map<string, number>(insertedDocuments.map(d => [`${d.title} ${d.content}`, d.id]));

      const keywordsUpdatePromises = Array.from(
        aggregatedAnalysisResult.values(),
      ).map((analysis) => {
        return tx
          .update(keywords)
          .set({
            frequency: sql`${keywords.frequency} + ${analysis.frequency}`,
            positiveSentimentDocumentsCount: sql`${keywords.positiveSentimentDocumentsCount} + ${analysis.positiveSentimentCount}`,
            negativeSentimentDocumentsCount: sql`${keywords.negativeSentimentDocumentsCount} + ${analysis.negativeSentimentCount}`,
            neutralSentimentDocumentsCount: sql`${keywords.neutralSentimentDocumentsCount} + ${analysis.neutralSentimentCount}`,
          })
          .where(eq(keywords.id, keywordToIdMap.get(analysis.word)));
      });


      const documentToKeywordRelationPromises = analysisResults
        .flatMap(r1 => r1.analysisResult.map(r2 => ({ result: r2, document: r1.document })))
        .map((r) => {
          return tx
            .insert(keywordsToDocuments)
            .values({
              keywordId: keywordToIdMap.get(r.result.word),
              documentId: documentToIdMap.get(`${r.document.title} ${r.document.content}`),
            });
        });

      await Promise.all([...keywordsUpdatePromises, ...documentToKeywordRelationPromises]);
    });

    return ApplicationResult.ok();
  }
}
