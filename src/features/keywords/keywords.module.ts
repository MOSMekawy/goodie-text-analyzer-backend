import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '../../persistence/persistence.module';
import { SearchKeywordsController } from './search-keywords/search-keywords.controller';
import { SearchKeywordsQueryHandler } from './search-keywords/search-keywords.query.handler';
import { GetKeywordByIdQueryHandler } from './get-keyword-by-id/get-keyword-by-id.query.handler';
import { GetKeywordByIdController } from './get-keyword-by-id/get-keyword-by-id.controller';

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [
    SearchKeywordsQueryHandler,
    GetKeywordByIdQueryHandler
  ],
  exports: [
    SearchKeywordsQueryHandler,
    GetKeywordByIdQueryHandler
  ],
  controllers: [GetKeywordByIdController, SearchKeywordsController],
})
export class KeywordsModule {}
