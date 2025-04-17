import { AggregateRoot } from '../../shared/domain/aggregate-root';
import { DomainResult } from '../../shared/domain/domain-result';
import { Name } from '../value-objects/';

export class Source extends AggregateRoot<number> {
  readonly id!: number;
  readonly name: Name;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(name: Name, createdAt: Date, updatedAt: Date) {
    super();
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Factory method
  public static create(name: string): DomainResult<Source> {
    const nameResult = Name.create(name);

    if (nameResult.isFailure) {
      return DomainResult.failure(nameResult.error);
    }

    const now = new Date();
    return DomainResult.success(new Source(nameResult.value, now, now));
  }
}
