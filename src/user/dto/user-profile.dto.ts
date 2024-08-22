import { ApiProperty } from "@nestjs/swagger";
import { Image, Prisma, UserImage, User } from "@prisma/client";
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
    birthDate: Date;

    @ApiProperty()
    created_at: Date;

    @ApiProperty({type: [GetGroupDto]})
    groups: GetGroupDto[]

    @ApiProperty()
    pfp: GetImageDto

    constructor(user: any) {
        this.id = user.id
        this.username = user.username
        this.email = user.email
        this.pfp = user.pfp ? new GetImageDto(user.pfp) : null
        this.groups = user.groups.map(group => new GetGroupDto(group.group))
        this.created_at = user.createdAt
        this.birthDate = user.birthDate
    }
}