import { ApiProperty } from "@nestjs/swagger"
import { User } from "@prisma/client"

export class PasswordChangeDto {
    @ApiProperty()
    token: string

    @ApiProperty()
    password: string

    user: User
}