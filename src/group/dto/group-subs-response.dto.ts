import { PaginationResponseDto } from "src/common/dto/pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { UserInfoDto } from "src/user/dto/user-info.dto";

export class GroupSubsResponseDto extends PaginationResponseDto<UserInfoDto> {
    @ApiProperty({ type: [UserInfoDto]})
    items: UserInfoDto[];
  }