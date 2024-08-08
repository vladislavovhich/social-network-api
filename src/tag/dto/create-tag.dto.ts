import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";

export class CreateTagDto {
    @ApiProperty()
    @IsString()
    name: string

    user: User
}
