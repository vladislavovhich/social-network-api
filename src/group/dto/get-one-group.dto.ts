import { ApiProperty, PickType } from "@nestjs/swagger";
import { GetCategoryDto } from "src/category/dto/get-category.dto";
import { GetImageDto } from "src/image/dto/get-image.dto";
import { UserInfoDto } from "src/user/dto/user-info.dto";
import { UserProfileDto } from "src/user/dto/user-profile.dto";

export class GetOneGroupDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    name: string

    @ApiProperty()
    description: string

    @ApiProperty()
    totalSubs: number

    @ApiProperty()
    created_at: Date

    @ApiProperty()
    admin: UserInfoDto

    @ApiProperty({type: [GetCategoryDto]})
    categories: GetCategoryDto[]

    @ApiProperty()
    pfp: GetImageDto;

    constructor(group: any) {
        this.id = group.id
        this.name = group.name
        this.description = group.description
        this.totalSubs = group._count.subs
        this.categories = group.categories.map(category => new GetCategoryDto(category.category))
        this.pfp = group.pfp ? new GetImageDto(group.pfp) : null
        this.admin = new UserInfoDto(group.admin)
        this.created_at = group.createdAt
    }
}