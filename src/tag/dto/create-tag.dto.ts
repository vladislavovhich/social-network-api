import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTagDto {
    @ApiProperty()
    @IsString()
    name: string

    userId: number
}
