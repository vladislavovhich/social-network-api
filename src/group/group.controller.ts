import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { multerOptions } from 'src/config/multer.config';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/common/decorators/extract-user.decorator';

@ApiTags('Group')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  create(@Body() createGroupDto: CreateGroupDto, @UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
    createGroupDto.file = file
    createGroupDto.admin = user

    return this.groupService.create(createGroupDto)
  }

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes("multipart/form-data")
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto, @UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
    updateGroupDto.file = file
    updateGroupDto.admin = user

    return this.groupService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }
}
