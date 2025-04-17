import { ApiProperty } from "@nestjs/swagger";

class DocumentDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  sourceId: number;
  @ApiProperty()
  externalId: number;
  @ApiProperty()
  createdAt: Date;
}

export class SearchDocumentsResponse {
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [DocumentDTO] })
  documents: DocumentDTO[];
}
