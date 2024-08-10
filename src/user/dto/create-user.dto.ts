import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsString, IsNotEmpty, IsAlphanumeric, MinLength, MaxLength, IsDate, IsOptional } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    file?: Express.Multer.File;
    
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    @MinLength(5)
    @MaxLength(25)
    password: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty()
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    birthDate: Date
}
