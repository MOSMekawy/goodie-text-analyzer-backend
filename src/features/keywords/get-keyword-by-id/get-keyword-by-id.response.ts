import { ApiProperty } from "@nestjs/swagger";

export class GetKeywordByIdResponse {
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
