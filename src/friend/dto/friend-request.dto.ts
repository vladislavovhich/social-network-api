import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FriendRequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    text: string

    userFromId: number
    userToId: number
}