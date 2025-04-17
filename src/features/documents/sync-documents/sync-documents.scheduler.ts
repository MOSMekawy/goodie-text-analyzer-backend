import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { SyncDocumentsCommand } from '../../../features/documents/sync-documents/sync-documents.command';

@Injectable()
export class SyncDocumentsScheduler {
  private readonly logger = new Logger(SyncDocumentsScheduler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Starting scheduled fetch of top posts');
    try {
      const command = new SyncDocumentsCommand();
      await this.commandBus.execute(command);
      this.logger.log('Successfully initiated top posts fetch');
    } catch (error) {
      this.logger.error(
        `Error initiating top posts fetch: ${error.message}`,
        error.stack,
      );
    }
  }
}
