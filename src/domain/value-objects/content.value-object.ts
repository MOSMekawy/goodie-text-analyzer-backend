import { DomainResult } from '../../shared/domain/domain-result';

export class Content {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public static create(value: string): DomainResult<Content> {
    if (!value || value.trim().length === 0) {
      return DomainResult.failure('Content cannot be empty');
    }

    return DomainResult.success(new Content(value.trim()));
  }

  public equals(other: Content): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
