import { ApiProperty } from "@nestjs/swagger"
import { UserInfoDto } from "src/user/dto/user-info.dto"

export class GetCommentDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    text: string

    @ApiProperty()
    commenter: UserInfoDto

    @ApiProperty()
    votes: number

    @ApiProperty()
    created_at: Date

    constructor(comment: any) {
        this.id = comment.id
        this.text = comment.text
        this.commenter = new UserInfoDto(comment.commenter)
        this.created_at = comment.createdAt
        this.votes = comment.votes.reduceRight((cur, prev) => cur + prev.vote.value, 0)
    }
}