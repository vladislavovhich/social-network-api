import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { FriendRequestDto } from './dto/friend-request.dto';
import { HandleFriendRequestDto } from './dto/handle-friend-request.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@ApiTags("Friend")
@Controller('/')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get('/users/friends-request-from-me')
  @UseGuards(AccessTokenGuard)
  getFriendRequestFromMe(@GetUser() user: User) {
    return this.friendService.getFriendRequestsFrom(user.id)
  }

  @Get('/users/friends-request-to-me')
  @UseGuards(AccessTokenGuard)
  getFriendsRequestToMe(@GetUser() user: User) {
    return this.friendService.getFriendRequestsTo(user.id)
  }

  @Get('/users/friends')
  @UseGuards(AccessTokenGuard)
  getMyFriends(@GetUser() user: User) {
    return this.friendService.getFriends(user.id)
  }

  @Delete("/users/friends/:id")
  @UseGuards(AccessTokenGuard)
  deleteFriend(
    @GetUser() user: User,
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.friendService.deleteFromFriends(user.id, id)
  }

  @Get('/users/:id/friends')
  getUserFriends(@Param("id", ParseIntPipe) userId: number) {
    return this.friendService.getFriends(userId)
  }

  @Post('/users/:id/add-friend')
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
