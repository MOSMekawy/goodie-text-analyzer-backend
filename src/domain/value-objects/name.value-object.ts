import { DomainResult } from '../../shared/domain/domain-result';

export class Name {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public static create(value: string): DomainResult<Name> {
    if (!value || value.trim().length === 0) {
      return DomainResult.failure('Name cannot be empty');
    }

    if (value.length > 255) {
      return DomainResult.failure('Name cannot exceed 255 characters');
    }

    return DomainResult.success(new Name(value.trim()));
  }

  public equals(other: Name): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
