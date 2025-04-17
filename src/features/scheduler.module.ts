import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '../persistence/persistence.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncDocumentsScheduler } from './documents/sync-documents/sync-documents.scheduler';
import { FeaturesModule } from './features.module';

@Module({
  imports: [
    CqrsModule,
    InfrastructureModule,
    PersistenceModule,
    ScheduleModule,
    FeaturesModule,
  ],
  providers: [SyncDocumentsScheduler],
})
export class SchedulerModule {}
