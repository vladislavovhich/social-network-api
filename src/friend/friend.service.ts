import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequestDto } from './dto/friend-request.dto';
import { HandleFriendRequestDto } from './dto/handle-friend-request.dto';
import { UserInfoDto } from 'src/user/dto/user-info.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { GetFriendReqDto } from './dto/get-friend-req.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FriendReqResponseDto } from './dto/friend-req-response.dto';
import { GroupSubsResponseDto } from 'src/group/dto/group-subs-response.dto';

@Injectable()
export class FriendService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async makeFriendRequest(friendRequestDto: FriendRequestDto){ 
    const {userFromId, userToId, text} = friendRequestDto

    const {user1, user2, isFriends} = await this.isAlreadyFriends(userFromId, userToId)

    if (user1.id == user2.id) {
      throw new BadRequestException("You can't add yourself to friends!")
    }

    if (isFriends) {
      throw new BadRequestException("You're already friend of the user, so you can't send request again!")
    }

    const friendRequest = await this.prisma.friendRequest.findFirst({
      where: {
        userFromId: userFromId,
        userToId: userToId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    if (isFriends || (friendRequest && friendRequest.isConfirmed)) {
      throw new BadRequestException("You're already friend of the user, so you can't send request again!")
    }

    if (friendRequest && friendRequest.isConfirmed == null) {
      throw new BadRequestException("You can't send one more request, user has not responed to previous one!")
    }

    await this.prisma.friendRequest.create({
      data: {
        userFrom: {connect: {id: userFromId}},
        userTo: {connect: {id: userToId}},
        text
      }
    })
  }

  async getFriendRequests(userId: number, paginationDto: PaginationDto, fromMe = true) {
    const {pageSize, offset} = paginationDto

    const requests = await this.prisma.friendRequest.findMany({
      where: {
        ...(fromMe ? {userToId: userId} : {userFromId: userId})
      },
      include: {
        userFrom: {
          include: {
            pfp: true
          }
        },
        userTo: {
          include: {
            pfp: true
          }
        }
      },
      take: pageSize,
      skip: offset
    })

    const count = await this.prisma.friendRequest.count({ where: { userToId: userId }})

    const reqDtos = requests.map(req => new GetFriendReqDto(req, fromMe ? req.userFrom : req.userTo))

    return new FriendReqResponseDto(reqDtos, count, paginationDto)
  }

  async getFriends(userId: number, paginationDto: PaginationDto) {
    await this.prisma.user.findFirstOrThrow({where: {id: userId}})

    const {pageSize, offset} = paginationDto

    const friends = await this.prisma.friend.findMany({
      where: {
        OR: [
          {userFirstId: userId},
          {userSecondId: userId}
        ]
      },
      include: {
        userFirst: {
          include: {
            pfp: true,
            images: {
              include: {
                image: true
              }
            }
          }
        },
        userSecond: {
          include: {
            pfp: true,
            images: {
              include: {
                image: true
              }
            }
          }
        },
      },
      take: pageSize,
      skip: offset
    })

    const count = await this.prisma.friend.count({
      where: {
        OR: [
          {userFirstId: userId},
          {userSecondId: userId}
        ]
    }})

    const users = friends.map(friend => {
      if (friend.userFirstId == userId) {
        return friend.userSecond
      } else {
        return friend.userFirst
      }
    })

    const userDtos = users.map(user => new UserInfoDto(user))

    return new GroupSubsResponseDto(userDtos, count, paginationDto)
  }

  async handleFriendRequest(handleRequestDto: HandleFriendRequestDto) {
    const {requestId, userId, confirmed} = handleRequestDto

    const friendRequest = await this.prisma.friendRequest.findFirstOrThrow({
      where: {id: requestId}
    })

    const {user1, user2, isFriends} = await this.isAlreadyFriends(friendRequest.userFromId, friendRequest.userToId)
    
    if (isFriends) {
      throw new BadRequestException("You're already friend of the user, so you can't edit request!")
    }

    if (friendRequest.userToId != userId) {
      throw new BadRequestException("You can't confirm the request cause it is send not to you!")
    }

    await this.prisma.friendRequest.update({
      where: {id: requestId},
      data: {
        isConfirmed: confirmed
      }
    })

    if (confirmed) {
      await this.prisma.friend.create({
        data: {
          userFirst: {connect: {id: user1.id}},
          userSecond: {connect: {id: user2.id}},
        }
      })
    }
  }

  async deleteFromFriends(userFirstId: number, userSecondId: number) {
    const {user1, user2, isFriends} = await this.isAlreadyFriends(userFirstId, userSecondId)

    if (!isFriends) {
      throw new BadRequestException("The user isn't your friend, so you can't delete him from friends!")
    }

    await this.prisma.friend.deleteMany({
      where: {
        OR: [
          {userFirstId: user1.id, userSecondId: user2.id},
          {userFirstId: user2.id, userSecondId: user1.id}
        ]
      }
    })
  }

  async checkUsers(id1: number, id2: number) {
    const user1 = await this.prisma.user.findFirstOrThrow({where: {id: id1}})
    const user2 = await this.prisma.user.findFirstOrThrow({where: {id: id2}})

    return {user1, user2}
  }

  async isAlreadyFriends(userFromId: number, userToId: number) {
    const {user1, user2} = await this.checkUsers(userFromId, userToId)

    const isFriends = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {userFirstId: userFromId, userSecondId: userToId},
          {userFirstId: userToId, userSecondId: userFromId}
        ]
      }
    })

    return {user1, user2, isFriends}
  }

  async isBlocked(userId: number, blockId: number) {
    return await this.prisma.userBlock.findFirst({
      where: {
        userId,
        blockId
      }
    })
  }

  async blockUser(blockUserDto: BlockUserDto) {
    const {userId, blockId} = blockUserDto
    
    await this.checkUsers(userId, blockId)

    if (userId == blockId) {
      throw new BadRequestException("You can't block yourself!")
    }

    const isBlocked = await this.isBlocked(userId, blockId)

    if (isBlocked) {
      throw new BadRequestException("User is already blocked, so you can't block him!")
    }

    await this.prisma.userBlock.create({
      data: {
        userId, blockId
      }
    })
  }

  async unblockUser(blockUserDto: BlockUserDto) {
    const {userId, blockId} = blockUserDto
    
    await this.checkUsers(userId, blockId)

    const isBlocked = await this.isBlocked(userId, blockId)

    if (!isBlocked) {
      throw new BadRequestException("User isn't blocked, so you can't unblock him!")
    }

    await this.prisma.userBlock.deleteMany({
      where: {userId, blockId}
    })
  }
}
