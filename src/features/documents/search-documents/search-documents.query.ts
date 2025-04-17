import { Query } from '@nestjs/cqrs';
import { ApplicationResult } from '../../../shared/application/application-result';
import { SearchDocumentsResponse } from './search-documents.response';
import { IsInt, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDocumentsQuery extends Query<
  ApplicationResult<SearchDocumentsResponse>
> {


  @ApiProperty({
    name: 'keywordId',
    required: false,
    description: 'Keyword to filter documents',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  keywordId?: number;

  @ApiProperty({
    name: 'fromDate',
    required: false,
    description: 'Start date for filtering',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fromDate?: Date;

  @ApiProperty({
    name: 'toDate',
    required: false,
    description: 'End date for filtering',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  toDate?: Date;

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
