import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsString, IsNotEmpty, IsAlphanumeric, MinLength, MaxLength, IsDate, IsOptional } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    file?: Express.Multer.File;
    
    @ApiProperty({example: "user@example.com"})
    @IsEmail()
    email: string;

    @ApiProperty({example: "starwars"})
    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    @MinLength(5)
    @MaxLength(25)
    password: string;

    @ApiProperty({example: "usrname123"})
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({example: "1987-05-04"})
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    birthDate: Date
}
