import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, UseGuards, Query } from '@nestjs/common';
import { FriendService } from './friend.service';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { FriendRequestDto } from './dto/friend-request.dto';
import { HandleFriendRequestDto } from './dto/handle-friend-request.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { BlockUserDto } from './dto/block-user.dto';
import { UserBlockGuard } from './guards/user-blocked.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FriendReqResponseDto } from './dto/friend-req-response.dto';
import { GroupSubsResponseDto } from 'src/group/dto/group-subs-response.dto';

@ApiTags("Friend")
@Controller('/')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}


  @Get('/users/friends-request-from-me')

  @ApiOkResponse({type: FriendReqResponseDto})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  getFriendRequestFromMe(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.friendService.getFriendRequests(user.id, paginationDto, false)
  }


  @Get('/users/friends-request-to-me')

  @ApiOkResponse({type: FriendReqResponseDto})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  getFriendsRequestToMe(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.friendService.getFriendRequests(user.id, paginationDto, true)
  }


  @Get('/users/friends')

  @ApiOkResponse({type: GroupSubsResponseDto})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})

  @UseGuards(AccessTokenGuard)

  getMyFriends(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.friendService.getFriends(user.id, paginationDto)
  }


  @Get("/users/:id/block")

  @ApiNotFoundResponse({description: "User not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(AccessTokenGuard)
  blockUser(@Param("id", ParseIntPipe) blockId: number, @GetUser() user: User) {
    const blockDto = new BlockUserDto()

    blockDto.blockId = blockId
    blockDto.userId = user.id

    return this.friendService.blockUser(blockDto)
  }


  @Get("/users/:id/unblock")

  @ApiNotFoundResponse({description: "User not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  unblockUser(@Param("id", ParseIntPipe) blockId: number, @GetUser() user: User) {
    const blockDto = new BlockUserDto()

    blockDto.blockId = blockId
    blockDto.userId = user.id

    return this.friendService.unblockUser(blockDto)
  }


  @Delete("/users/friends/:id")

  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiNotFoundResponse({description: "User not found"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  deleteFriend(
    @GetUser() user: User,
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.friendService.deleteFromFriends(user.id, id)
  }


  @Get('/users/:id/friends')

  @ApiOkResponse({type: GroupSubsResponseDto})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiNotFoundResponse({description: "User not found"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  getUserFriends(@Param("id", ParseIntPipe) userId: number, @Query() paginationDto: PaginationDto) {
    return this.friendService.getFriends(userId, paginationDto)
  }


  @Post('/users/:id/friends-request')

  @ApiNotFoundResponse({description: "User not found"})
  @ApiBadRequestResponse({description: "Incorrect input data | You blocked by the user"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(UserBlockGuard)
  @UseGuards(AccessTokenGuard)

  addUserToFriends(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() friendRequestDto: FriendRequestDto, 
  ) {
    friendRequestDto.userFromId = user.id
    friendRequestDto.userToId = id

    return this.friendService.makeFriendRequest(friendRequestDto)
  }


  @Put("/users/friends-request/:id/confirm") 

  @ApiNotFoundResponse({description: "Friend request not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  confirmFriendRequest(
    @Param("id", ParseIntPipe) requestId: number,
    @GetUser() user: User
  ) {
    const friendRequestDto = new HandleFriendRequestDto()

    friendRequestDto.confirmed = true
    friendRequestDto.requestId = requestId
    friendRequestDto.userId = user.id

    return this.friendService.handleFriendRequest(friendRequestDto)
  }


  @Put("/users/friends-request/:id/discard")

  @ApiNotFoundResponse({description: "Friend request not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @UseGuards(AccessTokenGuard) 

  discardFriendRequest(
    @Param("id", ParseIntPipe) requestId: number,
    @GetUser() user: User
  ) {
    const friendRequestDto = new HandleFriendRequestDto()

    friendRequestDto.confirmed = false
    friendRequestDto.requestId = requestId
    friendRequestDto.userId = user.id

    return this.friendService.handleFriendRequest(friendRequestDto)
  }
}
