import { ApiProperty } from "@nestjs/swagger";
import { GetGroupDto } from "src/group/dto/get-group.dto";
import { GetImageDto } from "src/image/dto/get-image.dto";

export class UserProfileDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    created_at: string;

    @ApiProperty({type: [GetGroupDto]})
    groups: GetGroupDto[]

    @ApiProperty({type: [GetImageDto]})
    images: GetImageDto[]
}