export interface KeywordAnalysis {
  word: string;
  frequency: number;
  sentimentScore: number;
}

export interface ITextAnalysisService {
  /**
   * Analyzes text to extract keywords and sentiment
   * @param keywords The list of keywords to analyze
   * @param text The text to analyze
   * @returns Analysis results including keywords and sentiment
   */
  analyzeText(keywords: string[], text: string): KeywordAnalysis[];
}
