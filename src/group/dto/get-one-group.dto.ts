import { ApiProperty, PickType } from "@nestjs/swagger";
import { GetCategoryDto } from "src/category/dto/get-category.dto";
import { GetImageDto } from "src/image/dto/get-image.dto";
import { UserProfileDto } from "src/user/dto/user-profile.dto";

class AdminGroupDto extends PickType(UserProfileDto, ['id', 'images', 'username']) {}


export class GetOneGroup {
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
    admin: AdminGroupDto

    @ApiProperty({type: [GetCategoryDto]})
    categories: GetCategoryDto[]

    @ApiProperty({type: [GetImageDto]})
    images: GetImageDto[]
}