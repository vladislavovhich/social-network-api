import { PaginationResponseDto } from "src/common/dto/pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { GetOneGroupDto } from "./get-one-group.dto";

export class GroupPaginationResponseDto extends PaginationResponseDto<GetOneGroupDto> {
    @ApiProperty({ type: [GetOneGroupDto]})
    items: GetOneGroupDto[];
  }