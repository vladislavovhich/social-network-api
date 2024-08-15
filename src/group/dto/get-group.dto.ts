import { ApiProperty } from "@nestjs/swagger";
import { Group } from "@prisma/client";

export class GetGroupDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    constructor(group: Group) {
        this.id = group.id
        this.name = group.name
    }
}