import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @ApiProperty({default: 1, required: false})
    @IsOptional()
    @Type(() => Number)
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    @Min(1)
    page: number = 1

    @ApiProperty({default: 5, required: false})
    @IsOptional()
    @Type(() => Number)
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    @Min(1)
    pageSize: number = 5

    get offset() {
        return (this.page - 1) * this.pageSize
    }
}