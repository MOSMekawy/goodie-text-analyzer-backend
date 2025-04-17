import {
  MessageHandlerErrorBehavior,
  RabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { RabbitMQWorker } from './rabbitmq-worker';
import { DiscoveryModule } from '@nestjs/core';
import { FeaturesModule } from '../../../features/features.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.worker'],
    }),
    CqrsModule,
    DiscoveryModule,
    FeaturesModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URI', 'amqp://localhost:5672'),
        channels: {
          'channel-1': {
            prefetchCount: 1,
            default: true,
          },
        },
        queues: [
          {
            name: configService.get<string>(
              'RABBITMQ_QUEUE_NAME',
              'worker-queue',
            ),
            options: { durable: true },
            defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.NACK,
          },
        ],
      }),
    }),
  ],
  providers: [RabbitMQWorker],
})
export class RabbitMQWorkerModule {}
