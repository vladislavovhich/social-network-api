import { PaginationResponseDto } from "src/common/dto/pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { UserDialogDto } from "./user-dialog.dto";

export class UserDialogsResponseDto extends PaginationResponseDto<UserDialogDto> {
    @ApiProperty({ type: [UserDialogDto]})
    items: UserDialogDto[];
  }