import { ApiProperty } from "@nestjs/swagger";
import { GetImageDto } from "src/image/dto/get-image.dto";

export class UserSearchDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;

    @ApiProperty()
    birthDate: Date;

    @ApiProperty()
    created_at: Date;

    @ApiProperty({type: [GetImageDto]})
    images: GetImageDto[]

    constructor(user: any) {
        this.id = user.id
        this.username = user.username
        this.images = user.images.map(image => new GetImageDto(image.image))
        this.created_at = user.createdAt
        this.birthDate = user.birthDate
    }
}