import { ApiProperty } from "@nestjs/swagger"

export class GetRuleDto {
    @ApiProperty()
    id: number

    @ApiProperty()
    title: string

    @ApiProperty()
    text: string

    @ApiProperty()
    order: number

    constructor(rule: any) {
        this.id = rule.id
        this.order = rule.order
        this.title = rule.title
        this.text = rule.text
    }
}