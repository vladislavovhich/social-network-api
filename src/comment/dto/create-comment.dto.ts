import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    text: string

    commenter: User
    postId: number
    commentId?: number
}
