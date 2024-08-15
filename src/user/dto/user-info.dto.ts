import { ApiProperty } from "@nestjs/swagger";
import { GetImageDto } from "src/image/dto/get-image.dto";

export class UserInfoDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;

    @ApiProperty()
    images: GetImageDto

    constructor(user: any) {
        this.id = user.id
        this.username = user.username
        this.images = user.images.map(image => new GetImageDto(image.image))
    }
}