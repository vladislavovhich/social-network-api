import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { DateFilterEnum, DateFilterType, PostFilterEnum, PostFilterType } from "src/common/types";

export class PostPaginationDto extends PaginationDto {
    @ApiProperty({enum: DateFilterEnum, default: DateFilterEnum.TODAY, required: false})
    @IsOptional()
    @IsEnum(DateFilterEnum)
    date: DateFilterType

    @ApiProperty({enum: PostFilterEnum, default: PostFilterEnum.NOW, required: false})
    @IsOptional()
    @IsEnum(PostFilterEnum)
    post: PostFilterType
}