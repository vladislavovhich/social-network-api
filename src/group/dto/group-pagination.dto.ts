import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsSemVer, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class GroupPaginationDto extends PaginationDto {
    @ApiProperty({type: [String], required: false})
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    @Type(() => String)
    @IsArray()
    @ArrayMinSize(1)
    categories: string[]

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title: string
}