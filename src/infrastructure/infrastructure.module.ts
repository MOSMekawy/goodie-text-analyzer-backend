import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQMessageBus } from './message-bus/rabbitmq-message-bus';
import { PostService } from './post-service/post-service';
import { TextAnalysisService } from './text-analysis/text-analysis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MockPostService } from './post-service/mock-post-service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URI', 'amqp://localhost:5672'),
        queues: [
          {
            name: configService.get<string>(
              'RABBITMQ_QUEUE_NAME',
              'worker-queue',
            ),
            options: { durable: true },
          },
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: 'IMessageBus',
      useClass: RabbitMQMessageBus,
    },
    {
      provide: 'IPostService',
      useClass: MockPostService,
    },
    {
      provide: 'ITextAnalysisService',
      useClass: TextAnalysisService,
    },
    RabbitMQMessageBus,
    PostService,
    MockPostService,
    TextAnalysisService,
  ],
  exports: [
    'IMessageBus',
    'IPostService',
    'ITextAnalysisService',
    RabbitMQMessageBus,
    PostService,
    MockPostService,
    TextAnalysisService,
  ],
})
export class InfrastructureModule {}
