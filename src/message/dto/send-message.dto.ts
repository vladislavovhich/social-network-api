import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    text: string

    senderId: number
    receiverId: number
}
