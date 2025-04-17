import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { SyncDocumentsCommandHandler } from './sync-documents/sync-documents.command.handler';
import { ProcessDocumentsCommandHandler } from './process-documents/process-documents.command.handler';
import { SearchDocumentsQueryHandler } from './search-documents/search-documents.query.handler';
import { SearchDocumentsController } from './search-documents/search-documents.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '../../persistence/persistence.module';

@Module({
  imports: [CqrsModule, InfrastructureModule, PersistenceModule],
  providers: [
    ProcessDocumentsCommandHandler,
    SyncDocumentsCommandHandler,
    SearchDocumentsQueryHandler,
  ],
  exports: [
    ProcessDocumentsCommandHandler,
    SyncDocumentsCommandHandler,
    SearchDocumentsQueryHandler,
  ],
  controllers: [SearchDocumentsController],
})
export class DocumentsModule {}
