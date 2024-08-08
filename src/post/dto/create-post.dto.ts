import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { User } from "src/user/entities/user.entity"

export class CreatePostDto {
    @ApiProperty({ type: 'string', format: 'binary', required: false, isArray: true })
    @IsOptional()
    files?: Express.Multer.File[];
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    text: string

    @ApiProperty({type: String, isArray: true})
    @Transform(({ value }) => value.split(","))
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    tags: string[]

    groupId: number
    
    publisher: User
}
