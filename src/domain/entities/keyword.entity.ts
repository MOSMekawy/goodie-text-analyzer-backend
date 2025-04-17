import { AggregateRoot } from '../../shared/domain/aggregate-root';
import { DomainResult } from '../../shared/domain/domain-result';

export class Keyword extends AggregateRoot<number> {
  readonly word: string;
  readonly frequency: number;
  readonly positiveSentimentDocumentCount: number;
  readonly neutralSentimentDocumentCount: number;
  readonly negativeSentimentDocumentCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(word: string) {
    super();
    this.word = word;
    this.frequency = 0;
    this.positiveSentimentDocumentCount = 0;
    this.neutralSentimentDocumentCount = 0;
    this.negativeSentimentDocumentCount = 0;
  }

  // Factory method
  public static create(word: string): DomainResult<Keyword> {
    if (!word || word.trim().length === 0) {
      return DomainResult.failure('Keyword cannot be empty');
    }

    return DomainResult.success(new Keyword(word.trim()));
  }
}
