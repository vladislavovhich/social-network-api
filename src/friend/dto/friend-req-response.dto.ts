import { PaginationResponseDto } from "src/common/dto/pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { GetFriendReqDto } from "./get-friend-req.dto";

export class FriendReqResponseDto extends PaginationResponseDto<GetFriendReqDto> {
    @ApiProperty({ type: [GetFriendReqDto]})
    items: GetFriendReqDto[];
}