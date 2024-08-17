import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { DateOrderEnum } from "src/common/types";

export class UserPaginationDto extends PaginationDto {
    @ApiProperty({required: false})
    @IsOptional()
    username: string

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Date)
    birthDate: Date

    @ApiProperty({enum : DateOrderEnum, default: DateOrderEnum.before, required: false})
    @IsOptional()
    order: DateOrderEnum
}