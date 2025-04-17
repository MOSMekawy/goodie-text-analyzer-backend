import { ApplicationResult } from 'src/shared/application/application-result';
import { Query } from '@nestjs/cqrs';
import { GetKeywordByIdResponse } from './get-keyword-by-id.response';

export class GetKeywordByIdQuery extends Query<
  ApplicationResult<GetKeywordByIdResponse>
> {
  id: number;

  constructor(id: number) {
    super();
    this.id = id;
  }
}
