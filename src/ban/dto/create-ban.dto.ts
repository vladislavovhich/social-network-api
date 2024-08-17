import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsInt, IsNotEmpty, IsSemVer, IsString, Min } from "class-validator"

export class CreateBanParamDto {
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    userId: number

    @ApiProperty()
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    groupId: number
}

export class CreateBanDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    reason: string

    @ApiProperty()
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    time: Date

    userId: number
    groupId: number
}