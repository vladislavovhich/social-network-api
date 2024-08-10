import { ApiProperty } from "@nestjs/swagger";

export class GetImageDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    url: string;
}