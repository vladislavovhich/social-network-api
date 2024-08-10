import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CheckOwnership } from 'src/common/decorators/check-ownership.decorator';
import { OwnershipGuard } from 'src/common/guards/check-ownership.guard';
import { User } from './entities/user.entity';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { UserProfileDto } from './dto/user-profile.dto';

@ApiTags("User")
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':id/profile')
    @ApiResponse({ status: 200, type: UserProfileDto })
    @ApiResponse({ status: 404, description: 'User not found'})
    getUserProfile(@Param('id') id: string) {
        return this.userService.findOneProfile(+id)
    }

    @Get('profile')
    @ApiResponse({ status: 200, type: UserProfileDto })
    @ApiResponse({ status: 401, description: 'User not authorized'})
    @UseGuards(AccessTokenGuard)
    getMyProfile(@GetUser() user: User) {
        return this.userService.findOneProfile(user.id)
    }

    @Patch('profile')
    @ApiResponse({ status: 200, type: UserProfileDto, description: "User updated" })
    @ApiResponse({ status: 400, description: "Incorrect input data" })
    @ApiResponse({ status: 401, description: 'User not authorized'})
    @ApiConsumes("multipart/form-data")
    @UseGuards(AccessTokenGuard)
    @UseInterceptors(FileInterceptor('file', multerOptions))
    update(@Body() updateUserDto: UpdateUserDto, @UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
        updateUserDto.file = file
        
        return this.userService.update(user.id, updateUserDto);
    }

    @Delete('profile')
    @ApiResponse({ status: 200, description: 'User deleted'})
    @ApiResponse({ status: 401, description: 'User not authorized'})
    @UseGuards(AccessTokenGuard)
    remove(@GetUser() user: User) {
        return this.userService.remove(user.id);
    }
}
