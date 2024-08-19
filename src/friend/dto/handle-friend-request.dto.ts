import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class HandleFriendRequestDto {
    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    confirmed: boolean

    userId: number
    requestId: number
}