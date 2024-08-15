import { ApiProperty } from "@nestjs/swagger"
import { Tag } from "@prisma/client"

export class GetTagDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    name: string

    constructor(tag: Tag) {
        this.id = tag.id
        this.name = tag.name
    }
}