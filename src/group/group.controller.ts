import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Put, Query, ParseIntPipe } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { multerOptions } from 'src/config/multer.config';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { GetOneGroupDto } from './dto/get-one-group.dto';
import { User } from '@prisma/client';
import { GroupPaginationDto } from './dto/group-pagination.dto';
import { GroupPaginationResponseDto } from './dto/group-pagination-response.dto';
import { ModeratorOpDto } from './dto/moderator-op.dto';
import { UserInfoDto } from 'src/user/dto/user-info.dto';
import { PassOnly } from './decorators/pass-type.decorator';
import { UserPassEnum } from './group.types';
import { PassUserGuard } from './guards/pass-user.guard';
import { ItemId } from 'src/common/decorators/item-id.decorator';

@ApiTags('Group')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get(":groupId/moderators")

  @ApiOkResponse({type: [UserInfoDto]})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  getModerators(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupService.getModerators(groupId)
  }


  @Put(":groupId/add-moderator/:userId")

  @ApiOkResponse({description: "User is added to moderators"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @PassOnly(UserPassEnum.Admin)
  @ItemId("groupId")
  @UseGuards(PassUserGuard)

  @UseGuards(AccessTokenGuard)

  addModerator(@Param() moderatorOpDto: ModeratorOpDto) {
    return this.groupService.addModerator(moderatorOpDto)
  }


  @Delete(":groupId/add-moderator/:userId")
  
  @ApiOkResponse({description: "User is removed from moderators"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @PassOnly(UserPassEnum.Admin)
  @ItemId("groupId")
  @UseGuards(PassUserGuard)

  @UseGuards(AccessTokenGuard)

  removeModerator(@Param() moderatorOpDto: ModeratorOpDto) {
    return this.groupService.removeModerator(moderatorOpDto)
  }


  @Put(':id/subscribe')

  @ApiOkResponse({description: "Subscribed to group"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})

  @UseGuards(AccessTokenGuard)

  subscribe(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.groupService.subscribe(id, user.id)
  }


  @Put(':id/unsubscribe')

  @ApiOkResponse({description: "Unsubscribed to group"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})

  @UseGuards(AccessTokenGuard)

  unsubscribe(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.groupService.unsubscribe(id, user.id)
  }

  @Post()

  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({description: "Created Group", type: GetOneGroupDto})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))

  async create(
    @Body() createGroupDto: CreateGroupDto, 
    @UploadedFile() file: Express.Multer.File, 
    @GetUser() user: User
  ) {
    createGroupDto.file = file
    createGroupDto.adminId = user.id

    const group = await this.groupService.create(createGroupDto)

    return this.groupService.getOneGroup(group.id)
  }


  @Get()

  @ApiResponse({status: 200, type: GroupPaginationResponseDto, description: "List of Groups"})

  findAll(@Query() groupPaginationDto: GroupPaginationDto) {
    return this.groupService.getAllGroups(groupPaginationDto);
  }


  @Get(':id')

  @ApiNotFoundResponse({description: "Group not found"})
  @ApiResponse({status: 200, type: GetOneGroupDto, description: "Found Group"})

  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.getOneGroup(id);
  }


  @Patch(':id')

  @ApiConsumes("multipart/form-data")
  @ApiResponse({status: 200, description: "Updated Group", type: GetOneGroupDto})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiForbiddenResponse({description: "Group does not belong to the user"})

  @PassOnly(UserPassEnum.Admin)
  @UseGuards(PassUserGuard)

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))

  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateGroupDto: UpdateGroupDto, 
    @UploadedFile() file: Express.Multer.File, 
    @GetUser() user: User
  ) {
    updateGroupDto.file = file
    updateGroupDto.adminId = user.id

    await this.groupService.update(id, updateGroupDto);

    return this.groupService.getOneGroup(id)
  }

  @Delete(':id')

  @ApiNotFoundResponse({description: "Group not found"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @PassOnly(UserPassEnum.Admin)
  @UseGuards(PassUserGuard)

  @UseGuards(AccessTokenGuard)
  
  remove(@Param('id', ParseIntPipe) id: number) {
    this.groupService.remove(id);
  }
}
