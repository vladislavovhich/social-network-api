import { ApiProperty } from "@nestjs/swagger";
import { UserInfoDto } from "src/user/dto/user-info.dto";

export class BannedUserDto {
    @ApiProperty()
    user: UserInfoDto

    @ApiProperty()
    reason: string

    @ApiProperty()
    unbanAt: Date

    @ApiProperty()
    bannedAt: Date

    constructor(ban: any) {
        this.user = new UserInfoDto(ban.banned)
        this.reason = ban.reason
        this.unbanAt = ban.time
        this.bannedAt = ban.createdAt
    }
}