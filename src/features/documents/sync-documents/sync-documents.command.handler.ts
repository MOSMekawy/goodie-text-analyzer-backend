import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SyncDocumentsCommand } from './sync-documents.command';
import { IPostService } from '../../../domain/contracts/post-service/post-service.interface';
import { IMessageBus } from '../../../domain/contracts/message-bus/message-bus.interface';
import { ApplicationResult } from '../../../shared/application/application-result';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { documents } from '../../../persistence/schemas/documents';
import { inArray } from 'drizzle-orm';
import { ProcessDocumentsCommand } from '../process-documents/process-documents.command';
import { sources } from '../../../persistence/schemas';
import { eq } from 'drizzle-orm';

@CommandHandler(SyncDocumentsCommand)
export class SyncDocumentsCommandHandler
  implements ICommandHandler<SyncDocumentsCommand>
{
  private readonly SOURCE_NAME = "HackerNews";

  constructor(
    @Inject('IPostService') private readonly postService: IPostService,
    @Inject('IMessageBus') private readonly messageBus: IMessageBus,
    @Inject('DB_CONTEXT') private readonly db: NodePgDatabase,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_: SyncDocumentsCommand): Promise<ApplicationResult> {
    const source = (
      await this.db
      .select()
      .from(sources)
      .where(eq(sources.name, this.SOURCE_NAME))
      .limit(1)
    )?.at(0);

    if (!source)
      return ApplicationResult.notFound(`Source '${this.SOURCE_NAME}' not found.`);

    const response = await this.postService.getTopPostIds();

    if (!response.success) return ApplicationResult.serviceUnAvailable();

    const fetchedIds = response.data;

    // Get existing documents matching any ids
    const existingDocs = await this.db
      .select({ externalId: documents.externalId })
      .from(documents)
      .where(inArray(documents.externalId, fetchedIds));

    const existingIds = new Set(existingDocs.map((doc) => doc.externalId));
    const newIds = fetchedIds.filter((id) => !existingIds.has(id));

    if (!newIds.length) return ApplicationResult.ok();

    await this.messageBus.publish(new ProcessDocumentsCommand(source.id, newIds));

    return ApplicationResult.ok();
  }
}
