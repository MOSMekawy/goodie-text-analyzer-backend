import { AggregateRoot } from '../../shared/domain/aggregate-root';

export class Document extends AggregateRoot<number> {
  readonly title: string;
  readonly content: string;
  readonly sourceId?: number;
  readonly externalId?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    title: string,
    content: string,
    sourceId?: number,
    externalId?: number,
  ) {
    super();
    this.title = title;
    this.content = content;
    this.sourceId = sourceId;
    this.externalId = externalId;
  }
}
