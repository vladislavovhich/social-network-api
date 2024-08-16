import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { DateFilterEnum, DateFilterType, PostFilterEnum, PostFilterType } from "src/common/types";

export class PostPaginationDto extends PaginationDto {
    @ApiProperty({enum: DateFilterEnum, default: DateFilterEnum.TODAY})
    @IsOptional()
    @IsEnum(DateFilterEnum)
    date: DateFilterType

    @ApiProperty({enum: PostFilterEnum, default: PostFilterEnum.NOW})
    @IsOptional()
    @IsEnum(PostFilterEnum)
    post: PostFilterType
}