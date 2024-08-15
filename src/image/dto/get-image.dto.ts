import { ApiProperty } from "@nestjs/swagger";
import { Image } from "@prisma/client";

export class GetImageDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    url: string;

    constructor(image: Image) {
        this.id = image.id
        this.url = image.url
    }
}