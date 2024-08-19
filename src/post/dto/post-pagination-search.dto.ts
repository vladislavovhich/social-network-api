import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, Min, ArrayMinSize } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class PostPaginationSearchDto extends PaginationDto {
    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    text: string

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    publisherId: number
    
    @ApiProperty({type: [String], required: false})
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    @IsArray()
    @ArrayMinSize(1)
    @IsString({each: true})
    @IsNotEmpty({each: true})
    tags: string[]
}