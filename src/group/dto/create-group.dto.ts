import { ApiProperty } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"
import { User } from "src/user/entities/user.entity"

export class CreateGroupDto {
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    file?: Express.Multer.File;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string

    @ApiProperty({type: String, isArray: true})
    @Transform(({ value }) => value.split(","))
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    categories: string[]

    admin: User
}
