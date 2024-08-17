import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { PaginationDto } from "./pagination.dto";

export class PaginationResponseDto<T> {
    @ApiProperty({type: [Object]})
    items: T[]

    @ApiProperty()
    nextPage?: number

    @ApiProperty()
    prevPage?: number

    constructor(items: T[], count: number, paginationDto: PaginationDto) {
        this.items = items

        const {offset, page, pageSize} = paginationDto

        if (count > 0 && count - page * pageSize > 0) {
            this.nextPage = page + 1
        }

        if (count - offset > 0 && page - 1 > 0) {
            this.prevPage = page - 1
        }
    }
}