import { ApiProperty } from "@nestjs/swagger";

class KeywordDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  word: string;
  @ApiProperty()
  frequency: number;
  @ApiProperty()
  positiveMentions: number;
  @ApiProperty()
  neutralMentions: number;
  @ApiProperty()
  negativeMentions: number;
}

export class SearchKeywordsResponse {
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [KeywordDTO] })
  keywords: KeywordDTO[];
}
