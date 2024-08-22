import { ApiProperty } from "@nestjs/swagger";
import { UserInfoDto } from "src/user/dto/user-info.dto";

export class GetFriendReqDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    text: string

    @ApiProperty()
    isConfirmed: boolean

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    user: UserInfoDto
    
    constructor(friendReq: any, user: any) {
        this.id = friendReq.id
        this.text = friendReq.text
        this.isConfirmed = friendReq.isConfirmed
        this.createdAt = friendReq.createdAt
        this.user = new UserInfoDto(user)
    }
}