import { PaginationResponseDto } from "src/common/dto/pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { BannedUserDto } from "./banned-user-dto";

export class BannedUsersResponseDto extends PaginationResponseDto<BannedUserDto> {
    @ApiProperty({ type: [BannedUserDto]})
    items: BannedUserDto[];
  }