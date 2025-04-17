import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQWorkerModule } from './infrastructure/message-bus/subscriber/rabbitmq-worker.module';

async function bootstrap() {
  const logger = new Logger('RabbitMQListenerMain');

  try {
    logger.log('Starting RabbitMQ Listener application...');

    const app = await NestFactory.create(RabbitMQWorkerModule);
    const configService = app.get(ConfigService);

    const port = configService.get<number>('RABBITMQ_WORKER_PORT', 3001);

    await app.listen(port);

    logger.log(`RabbitMQ Listener application is running on port ${port}`);
    logger.log('Listening for RabbitMQ messages...');
  } catch (error) {
    logger.error(
      `Failed to start RabbitMQ Listener: ${error.message}`,
      error.stack,
    );
    process.exit(1);
  }
}

// Start the application
bootstrap();
