import { ApiProperty } from "@nestjs/swagger"
import { GetImageDto } from "src/image/dto/get-image.dto"
import { GetTagDto } from "src/tag/dto/get-tag.dto"
import { UserInfoDto } from "src/user/dto/user-info.dto"

export class GetPostDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    text: string

    @ApiProperty()
    views: number

    @ApiProperty()
    votes: number = 0

    @ApiProperty()
    comments: number

    @ApiProperty()
    created_at: Date

    @ApiProperty()
    publisher: UserInfoDto

    @ApiProperty({type: [GetImageDto]})
    images: GetImageDto[]

    @ApiProperty({type: [GetTagDto]})
    tags: GetTagDto[]

    constructor(post: any) {
        this.id = post.id
        this.text = post.text
        this.comments = post._count.comments
        this.views = post._count.views
        this.publisher = new UserInfoDto(post.publisher)
        this.images = post.images.map(image => new GetImageDto(image.image))
        this.tags = post.tags.map(tag => new GetTagDto(tag.tag))
        this.votes = post._sum
        this.created_at = post.createdAt
    }
}