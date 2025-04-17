import { StatusCode } from './status-code.enum';

export class ApplicationError {
  constructor(
    public readonly statusCode: StatusCode,
    public readonly message: string,
  ) {}

  public static badRequest(message: string): ApplicationError {
    return new ApplicationError(StatusCode.BAD_REQUEST, message);
  }

  public static unauthorized(message: string): ApplicationError {
    return new ApplicationError(StatusCode.UNAUTHORIZED, message);
  }

  public static forbidden(message: string): ApplicationError {
    return new ApplicationError(StatusCode.FORBIDDEN, message);
  }

  public static notFound(message: string): ApplicationError {
    return new ApplicationError(StatusCode.NOT_FOUND, message);
  }

  public static conflict(message: string): ApplicationError {
    return new ApplicationError(StatusCode.CONFLICT, message);
  }

  public static unprocessableEntity(message: string): ApplicationError {
    return new ApplicationError(StatusCode.UNPROCESSABLE_ENTITY, message);
  }

  public static internalServerError(
    message: string = 'Internal server error.',
  ): ApplicationError {
    return new ApplicationError(StatusCode.INTERNAL_SERVER_ERROR, message);
  }

  public static serviceUnAvailable(
    message: string = 'Service is not available at the moment.',
  ): ApplicationError {
    return new ApplicationError(StatusCode.SERVICE_UNAVAILABLE, message);
  }
}
