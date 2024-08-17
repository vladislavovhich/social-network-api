import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsString, Min, MinLength } from "class-validator"

export class CreateRuleDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    title: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    text: string

    groupId: number
}
