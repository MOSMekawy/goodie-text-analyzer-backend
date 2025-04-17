import { ApplicationResult } from 'src/shared/application/application-result';
import { SearchKeywordsResponse } from './search-keywords.response';
import { Query } from '@nestjs/cqrs';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchKeywordsQuery extends Query<
  ApplicationResult<SearchKeywordsResponse>
> {
  @ApiProperty({
    name: 'search',
    required: false,
    description: 'Search term to filter keywords',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    name: 'skip',
    required: false,
    description: 'Number of items to skip',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  skip?: number;

  @ApiProperty({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  limit?: number;
}
