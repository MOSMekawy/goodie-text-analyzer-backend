import { Injectable } from '@nestjs/common';
import * as natural from 'natural';
import {
  ITextAnalysisService,
  KeywordAnalysis,
} from '../../domain/contracts/text-analysis/text-analysis-service.interface';

@Injectable()
export class TextAnalysisService implements ITextAnalysisService {
  private readonly analyzer = new natural.SentimentAnalyzer(
    'English',
    natural.PorterStemmer,
    'afinn',
  );

  /**
   * Analyzes text to extract keywords and sentiment
   * @param text The text to analyze
   * @returns Analysis results including keywords and sentiment
   */
  public analyzeText(keywords: string[], text: string): KeywordAnalysis[] {
    // Tokenize and normalize text
    const tokens = text.toLowerCase().split(/\s+/);

    // Remove stopwords and short words
    const stopwords = natural.stopwords;
    const filteredTokens = tokens.filter(
      (token) => token.length > 2 && !stopwords.includes(token),
    );

    // Get sentiment score
    const sentimentScore = this.analyzer.getSentiment(filteredTokens);

    // Count word frequencies
    const wordFrequency = new Map<string, number>();
    filteredTokens.forEach((token) => {
      wordFrequency.set(token, (wordFrequency.get(token) ?? 0) + 1);
    });

    return keywords.map((keyword) => {
      const frequency = wordFrequency.get(keyword.toLowerCase()) ?? 0;

      return {
        word: keyword,
        frequency,
        sentimentScore: frequency > 0 ? sentimentScore : 0,
      };
    });
  }
}
