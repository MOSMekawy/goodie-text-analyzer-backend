/**
 * Used to encapsulate success or failure outcomes from domain operations
 */
export class DomainResult<T = void> {
  private readonly _isSuccess: boolean;
  private readonly _error: string | null;
  private readonly _value: T | null;

  private constructor(
    isSuccess: boolean,
    error: string | null,
    value: T | null,
  ) {
    this._isSuccess = isSuccess;
    this._error = error;
    this._value = value;
  }

  /**
   * Indicates whether the result is a success
   */
  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Indicates whether the result is a failure
   */
  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Returns the error message if the result is a failure
   * @throws Error if the result is a success
   */
  public get error(): string {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a success result');
    }

    return this._error as string;
  }

  /**
   * Returns the value if the result is a success
   * @throws Error if the result is a failure
   */
  public get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failure result');
    }

    return this._value as T;
  }

  /**
   * Creates a success result
   */
  public static success<U = void>(value?: U): DomainResult<U> {
    return new DomainResult<U>(true, null, value ?? (null as unknown as U));
  }

  /**
   * Creates a failure result with the specified error message
   */
  public static failure<U = void>(error: string): DomainResult<U> {
    return new DomainResult<U>(false, error, null);
  }

  /**
   * Combines multiple results and returns a failure if any of them is a failure
   */
  public static combine(results: DomainResult<any>[]): DomainResult<void> {
    for (const result of results) {
      if (result.isFailure) {
        return DomainResult.failure(result.error);
      }
    }

    return DomainResult.success();
  }

  /**
   * Executes the callback if the result is a success and returns a new result
   */
  public onSuccess<U>(
    callback: (value: T) => DomainResult<U>,
  ): DomainResult<U> {
    if (this.isFailure) {
      return DomainResult.failure(this.error);
    }

    return callback(this.value);
  }

  /**
   * Executes the callback if the result is a failure and returns a new result
   */
  public onFailure<U>(
    callback: (error: string) => DomainResult<U>,
  ): DomainResult<U | T> {
    if (this.isSuccess) {
      return DomainResult.success<T>(this.value);
    }

    return callback(this.error);
  }

  /**
   * Maps the value of a success result to a new value
   */
  public map<U>(mapper: (value: T) => U): DomainResult<U> {
    if (this.isFailure) {
      return DomainResult.failure<U>(this.error);
    }

    return DomainResult.success<U>(mapper(this.value));
  }
}
