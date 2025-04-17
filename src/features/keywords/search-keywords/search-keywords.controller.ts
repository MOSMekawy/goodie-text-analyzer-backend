import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { SearchKeywordsQuery } from './search-keywords.query';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchKeywordsResponse } from './search-keywords.response';

@ApiTags('keywords')
@Controller('keywords')
export class SearchKeywordsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get keywords with optional filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Keywords retrieved successfully',
    type: SearchKeywordsResponse,
  })
  getKeywords(@Query() query: SearchKeywordsQuery) {
    return this.queryBus.execute(query);
  }
}
