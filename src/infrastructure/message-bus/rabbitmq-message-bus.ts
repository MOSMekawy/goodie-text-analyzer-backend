import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { IMessageBus } from '../../domain/contracts/message-bus/message-bus.interface';
import { Command, Query } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ApplicationResult } from '../../shared/application/application-result';

@Injectable()
export class RabbitMQMessageBus implements IMessageBus {
  private readonly QUEUE_NAME = this.configService.get<string>(
    'RABBITMQ_QUEUE_NAME',
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async publish<T>(
    message: Command<ApplicationResult<T>> | Query<ApplicationResult<T>>,
  ): Promise<void> {
    const commandName = message.constructor.name;

    await this.amqpConnection.publish('', this.QUEUE_NAME, {
      commandName,
      payload: message,
    });
  }
}
