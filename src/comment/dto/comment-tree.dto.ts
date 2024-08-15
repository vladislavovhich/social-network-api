import { ApiProperty } from "@nestjs/swagger";
import { GetCommentDto } from "./get-comment.dto";

class SignleTreeDto {
    @ApiProperty()
    item: GetCommentDto

    @ApiProperty()
    children: []

    constructor(item: GetCommentDto) {
        this.item = item
    }
}

export class CommentTreeDto {
    @ApiProperty()
    item: GetCommentDto

    @ApiProperty({type: [SignleTreeDto]})
    children: CommentTreeDto[] = []

    constructor(item: GetCommentDto) {
        this.item = item
    }
}