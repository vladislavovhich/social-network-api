import { PaginationResponseDto } from "src/common/dto/pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { UserSearchDto } from "./user-search.dto";

export class UsersResponseDto extends PaginationResponseDto<UserSearchDto> {
    @ApiProperty({ type: [UserSearchDto]})
    items: UserSearchDto[];
  }