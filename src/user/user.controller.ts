import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CheckOwnership } from 'src/common/decorators/check-ownership.decorator';
import { OwnershipGuard } from 'src/common/guards/check-ownership.guard';

@ApiTags("User")
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    @Patch(':id')
    @ApiConsumes("multipart/form-data")
    @CheckOwnership('User', 'id')
    @UseGuards(OwnershipGuard)
    @UseGuards(AccessTokenGuard)
    @UseInterceptors(FileInterceptor('file', multerOptions))
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file: Express.Multer.File) {
        updateUserDto.file = file
        
        return this.userService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @CheckOwnership('User', 'id')
    @UseGuards(OwnershipGuard)
    @UseGuards(AccessTokenGuard)
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
