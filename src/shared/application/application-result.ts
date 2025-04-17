import { ApplicationError } from './application-error';

export class ApplicationResult<T = void> {
  private readonly _isSuccess: boolean;
  private readonly _error: ApplicationError | null;
  private readonly _value: T | null;

  private constructor(
    isSuccess: boolean,
    error: ApplicationError | null,
    value: T | null,
  ) {
    this._isSuccess = isSuccess;
    this._error = error;
    this._value = value;
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public get error() {
    return this._error;
  }

  public get value() {
    return this._value;
  }

  public static ok<U = void>(value?: U): ApplicationResult<U> {
    return new ApplicationResult<U>(true, null, value ?? null);
  }

  public static notFound<U = void>(message: string): ApplicationResult<U> {
    return new ApplicationResult<U>(
      false,
      ApplicationError.notFound(message),
      null,
    );
  }

  public static internalServerError<U = void>(
    message: string,
  ): ApplicationResult<U> {
    return new ApplicationResult<U>(
      false,
      ApplicationError.internalServerError(message),
      null,
    );
  }

  public static serviceUnAvailable<U = void>(
    message?: string,
  ): ApplicationResult<U> {
    return new ApplicationResult<U>(
      false,
      ApplicationError.serviceUnAvailable(message),
      null,
    );
  }
}
