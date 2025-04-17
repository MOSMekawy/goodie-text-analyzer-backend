import { ApplicationError } from '../application/application-error';
import { ApplicationResult } from '../application/application-result';
import { StatusCode } from '../application/status-code.enum';

export class Envelope<T = any> {
  readonly success: boolean;
  readonly statusCode: StatusCode;
  readonly data?: T;
  readonly error?: string;

  private constructor(success: boolean, data?: T, error?: ApplicationError) {
    this.success = success;
    this.data = data ?? null;
    this.statusCode = error?.statusCode ?? StatusCode.OK;
    this.error = error?.message ?? null;
  }

  /**
   * Creates an envelope from an ApplicationResult
   * @param result The application result to convert
   */
  public static fromResult<T>(result: ApplicationResult<T>): Envelope<T> {
    return new Envelope(
      result.isSuccess,
      result.value,
      result.error
    );
  }
}
