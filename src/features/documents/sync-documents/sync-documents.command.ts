import { Command } from '@nestjs/cqrs';
import { ApplicationResult } from '../../../shared/application/application-result';

export class SyncDocumentsCommand extends Command<ApplicationResult> {
  constructor() {
    super();
  }
}
