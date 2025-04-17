import { Command, Query } from '@nestjs/cqrs';
import { ApplicationResult } from '../../../shared/application/application-result';

export interface IMessageBus {
  publish<T>(
    message: Command<ApplicationResult<T>> | Query<ApplicationResult<T>>,
  ): Promise<void>;
}
