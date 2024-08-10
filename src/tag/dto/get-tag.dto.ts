import { ApiProperty } from "@nestjs/swagger"

export class GetTagDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    name: string
}