import { ApiProperty } from "@nestjs/swagger"

export class GetCategoryDto {
    @ApiProperty()
    id: number
    
    @ApiProperty()
    name: number

    constructor(category: any) {
        this.id = category.id
        this.name = category.name
    }
}