import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, Min } from "class-validator"

export class ModeratorOpDto {
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    groupId: number

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    userId: number
}