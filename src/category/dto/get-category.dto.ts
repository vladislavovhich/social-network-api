import { ApiProperty } from "@nestjs/swagger"

export class GetCategoryDto {
    @ApiProperty()
    id: number
    
    @ApiProperty()
    name: string

    constructor(category: any) {
        this.id = category.id
        this.name = category.name
    }
}