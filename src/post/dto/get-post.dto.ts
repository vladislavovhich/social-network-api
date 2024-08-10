import { ApiProperty } from "@nestjs/swagger"
import { GetImageDto } from "src/image/dto/get-image.dto"
import { GetTagDto } from "src/tag/dto/get-tag.dto"
import { UserProfileDto } from "src/user/dto/user-profile.dto"
import { PickType } from "@nestjs/swagger"

class PostPublisherDto extends PickType(UserProfileDto, ['id', 'images', 'username']) {}

export class GetPostDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    text: string

    @ApiProperty()
    watched: number

    @ApiProperty()
    rating: number

    @ApiProperty()
    totalComments: number

    @ApiProperty()
    created_at: Date

    @ApiProperty()
    publisher: PostPublisherDto

    @ApiProperty({type: [GetImageDto]})
    images: GetImageDto[]

    @ApiProperty({type: [GetTagDto]})
    tags: GetTagDto[]

}