import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { GetKeywordByIdQuery } from '../get-keyword-by-id/get-keyword-by-id.query';
import { GetKeywordByIdResponse } from '../get-keyword-by-id/get-keyword-by-id.response';

@ApiTags('keywords')
@Controller('keywords')
export class GetKeywordByIdController  {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/:id')
  @ApiOperation({
    summary: 'Get a keyword by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the keyword to retrieve',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Keyword retrieved successfully',
    type: GetKeywordByIdResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Keyword not found',
  })
  getKeywordById(@Param('id') id: number) {
    return this.queryBus.execute(new GetKeywordByIdQuery(id));
  }
}
