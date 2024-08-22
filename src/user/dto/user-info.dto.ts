import { ApiProperty } from "@nestjs/swagger";
import { GetImageDto } from "src/image/dto/get-image.dto";

export class UserInfoDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;

    @ApiProperty()
    pfp: GetImageDto

    constructor(user: any) {
        this.id = user.id
        this.username = user.username
        this.pfp = user.pfp ? new GetImageDto(user.pfp) : null
    }
}