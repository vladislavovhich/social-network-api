import { ApiProperty } from "@nestjs/swagger";
import { Group } from "@prisma/client";
import { GetImageDto } from "src/image/dto/get-image.dto";

export class GetGroupDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
    
    @ApiProperty()
    pfp: GetImageDto;

    constructor(group: any) {
        this.id = group.id
        this.name = group.name
        this.pfp = group.pfp ? new GetImageDto(group.pfp) : null
    }
}