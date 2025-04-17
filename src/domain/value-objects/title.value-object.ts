import { DomainResult } from '../../shared/domain/domain-result';

export class Title {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public static create(value: string): DomainResult<Title> {
    if (!value || value.trim().length === 0) {
      return DomainResult.failure('Title cannot be empty');
    }

    if (value.length > 255) {
      return DomainResult.failure('Title cannot exceed 255 characters');
    }

    return DomainResult.success(new Title(value.trim()));
  }

  public equals(other: Title): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
