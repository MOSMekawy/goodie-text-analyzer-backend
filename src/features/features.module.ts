import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '../persistence/persistence.module';
import { KeywordsModule } from './keywords/keywords.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    KeywordsModule,
    DocumentsModule,
    CqrsModule,
    InfrastructureModule,
    PersistenceModule
  ],
  exports: [
    KeywordsModule,
    DocumentsModule,
  ],
})
export class FeaturesModule { }
