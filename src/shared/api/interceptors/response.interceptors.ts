import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
import { ApplicationResult } from '../../application/application-result';
import { Envelope } from '../envelope';

  export interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
  }

  @Injectable()
  export class ResponseInterceptor<T>
    implements NestInterceptor<T, Response<T>> {
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<Response<T>> {
      const httpContext = context.switchToHttp();
      const response = httpContext.getResponse();

      return next
        .handle()
        .pipe(
          map((data) => {
            if (data instanceof ApplicationResult) {
                const wrappedResponse = Envelope.fromResult(data);
                response.status(wrappedResponse.statusCode);
                return wrappedResponse;
            }
            return data;
          }),
        );
    }
  }
