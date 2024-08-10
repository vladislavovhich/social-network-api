import { ApiProperty } from "@nestjs/swagger";

export class GetGroupDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}