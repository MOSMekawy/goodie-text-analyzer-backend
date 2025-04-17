import { Command } from '@nestjs/cqrs';
import { ApplicationResult } from '../../../shared/application/application-result';

export class ProcessDocumentsCommand extends Command<ApplicationResult> {
  constructor(
    public readonly sourceId: number,
    public readonly ids: number[],
  ) {
    super();
  }
}
