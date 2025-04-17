import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { ApplicationResult } from 'src/shared/application/application-result';
import { Envelope } from '../envelope';
import { AbstractHttpAdapter } from '@nestjs/core';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  constructor(private readonly httpAdapter: AbstractHttpAdapter) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    this.logger.error(exception);

    const result = ApplicationResult.internalServerError('An error occured.');
    const wrappedResponse = Envelope.fromResult(result);

    this.httpAdapter.reply(ctx.getResponse(), wrappedResponse, wrappedResponse.statusCode);
  }
}
