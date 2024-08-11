import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { multerOptions } from 'src/config/multer.config';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { GetOneGroup } from './dto/get-one-group.dto';
import { User } from '@prisma/client';

@ApiTags('Group')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Put(':id/subscribe')

  @ApiOkResponse({description: "Subscribed to group"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiResponse({status: 401, description: "User not authorized"})

  @UseGuards(AccessTokenGuard)

  subscribe(@Param('id') id: string, @GetUser() user: User) {
    return this.groupService.subscribe(+id, user.id)
  }

  @Put(':id/unsubscribe')

  @ApiOkResponse({description: "Unsubscribed to group"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiResponse({status: 401, description: "User not authorized"})

  @UseGuards(AccessTokenGuard)

  unsubscribe(@Param('id') id: string, @GetUser() user: User) {
    return this.groupService.unsubscribe(+id, user.id)
  }

  @Post()

  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({description: "Created Group", type: GetOneGroup})
  @ApiResponse({status: 401, description: "User not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))

  create(@Body() createGroupDto: CreateGroupDto, @UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
    createGroupDto.file = file
    createGroupDto.adminId = user.id

    return this.groupService.create(createGroupDto)
  }

  @Get()
  @ApiResponse({status: 200, type: [GetOneGroup], description: "List of Groups"})
  findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')

  @ApiNotFoundResponse({description: "Group not found"})
  @ApiResponse({status: 200, type: GetOneGroup, description: "Found Group"})

  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')

  @ApiConsumes("multipart/form-data")
  @ApiResponse({status: 200, description: "Updated Group", type: GetOneGroup})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiResponse({status: 401, description: "User not authorized"})
  @ApiForbiddenResponse({description: "Group does not belong to the user"})

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))

  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto, @UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
    updateGroupDto.file = file
    updateGroupDto.adminId = user.id

    return this.groupService.update(+id, updateGroupDto);
  }

  @Delete(':id')

  @ApiNotFoundResponse({description: "Group not found"})
  @ApiResponse({status: 401, description: "User not authorized"})
  @ApiForbiddenResponse({description: "Group does not belong to the user"})

  @UseGuards(AccessTokenGuard)
  
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }
}
