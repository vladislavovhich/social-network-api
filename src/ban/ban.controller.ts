import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { BanService } from './ban.service';
import { CreateBanDto, CreateBanParamDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BannedUsersResponseDto } from './dto/banned-users-response.dto';
import { GroupId } from 'src/group/decorators/group-id.decorator';
import { PassOnly } from 'src/group/decorators/pass-type.decorator';
import { UserPassEnum } from 'src/group/group.types';
import { PassUserGuard } from 'src/group/guards/pass-user.guard';

@ApiTags("Ban")
@Controller('/')
export class BanController {
  constructor(private readonly banService: BanService) {}

  @Put('/groups/:groupId/ban-user/:userId')

  @ApiOkResponse({description: "User is banned"})
  @ApiNotFoundResponse({description: "Group or user not found"})
  @ApiForbiddenResponse({description: "Only admin and moderators can ban users"})
  @ApiBadRequestResponse({description: "User is already banned"})

  @ApiResponse({status: 401, description: "Not authorized"})

  @PassOnly(UserPassEnum.Admin)
  @GroupId("groupId")
  @UseGuards(PassUserGuard)

  @UseGuards(AccessTokenGuard)
  
  ban(@Param() createBanParamDto: CreateBanParamDto, @Body() createBanDto: CreateBanDto) {
    createBanDto.groupId = createBanParamDto.groupId
    createBanDto.userId = createBanParamDto.userId

    return this.banService.ban(createBanDto)
  }


  @Put('/groups/:groupId/unban-user/:userId')

  @ApiOkResponse({description: "User is unbanned"})
  @ApiNotFoundResponse({description: "Group or user not found"})
  @ApiForbiddenResponse({description: "Only admin and moderators can unban users"})
  @ApiBadRequestResponse({description: "User is not banned, so you can't unban him"})
  @ApiResponse({status: 401, description: "Not authorized"})

  @PassOnly(UserPassEnum.Admin)
  @GroupId("groupId")
  @UseGuards(PassUserGuard)

  @UseGuards(AccessTokenGuard)
  unban(@Param() createBanParamDto: CreateBanParamDto) {
    return this.banService.unban(createBanParamDto)
  }


  @Get('/groups/:groupId/banned-users')

  @ApiOkResponse({type: BannedUsersResponseDto})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiForbiddenResponse({description: "Only admin and moderators are allowed to see banned users list"})
  @ApiResponse({status: 401, description: "Not authorized"})

  @PassOnly(UserPassEnum.AdminAndModerators)
  @GroupId("groupId")
  @UseGuards(PassUserGuard)

  @UseGuards(AccessTokenGuard)

  getBannedUsers(@Param("groupId") groupId: string, @Query() paginationDto: PaginationDto) {
    return this.banService.getBannedUsers(+groupId, paginationDto)
  }
}
