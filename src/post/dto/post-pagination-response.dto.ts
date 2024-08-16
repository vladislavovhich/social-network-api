import { PaginationResponseDto } from "src/common/dto/pagination-response.dto";
import { GetPostDto } from "./get-post.dto";
import { ApiProperty } from "@nestjs/swagger";

export class PostPaginationResponseDto extends PaginationResponseDto<GetPostDto> {
    @ApiProperty({ type: [GetPostDto]})
    items: GetPostDto[];
  }