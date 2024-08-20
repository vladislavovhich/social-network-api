import { ApiProperty } from "@nestjs/swagger"
import { UserInfoDto } from "src/user/dto/user-info.dto"

export class UserDialogDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    text: string

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    isSeen: boolean

    @ApiProperty()
    user: UserInfoDto

    constructor(message: any, sender: any) {
        this.id = message.id
        this.user = new UserInfoDto(sender)
        this.text = message.text
        this.createdAt = message.createdAt
        this.isSeen = message.isSeen
    }
}