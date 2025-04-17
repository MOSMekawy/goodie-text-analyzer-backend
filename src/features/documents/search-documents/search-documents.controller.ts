import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { SearchDocumentsQuery } from './search-documents.query';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchDocumentsResponse } from './search-documents.response';

@ApiTags('documents')
@Controller('documents')
export class SearchDocumentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/')
  @ApiOperation({
    summary: 'Search documents with optional keyword and date filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
    type: SearchDocumentsResponse,
  })
  searchDocuments(@Query() query: SearchDocumentsQuery) {
    return this.queryBus.execute(query);
  }
}
