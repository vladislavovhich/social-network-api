import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBanDto, CreateBanParamDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { GroupService } from 'src/group/group.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BannedUserDto } from './dto/banned-user-dto';
import { Prisma } from '@prisma/client';
import { BannedUsersResponseDto } from './dto/banned-users-response.dto';

@Injectable()
export class BanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly groupService: GroupService
  ) {}

  async ban(createBanDto: CreateBanDto) {
    const {reason, userId, groupId, time} = createBanDto

    await this.userService.findOne(userId)
    await this.groupService.findOne(groupId)

    const isBanned = await this.isBanned(userId, groupId)
    const isAdmin = await this.groupService.isAdmin(groupId, userId)

    if (isAdmin) {
      throw new BadRequestException("You can't ban admin!")
    }
    
    if (isBanned) {
      throw new BadRequestException("User is already banned!")
    }

    await this.prisma.groupBan.create({
      data: {
        group: {connect: {id: groupId}},
        banned: {connect: {id: userId}},
        reason,
        time
      }
    })
  }

  async getBannedUsers(groupId: number, paginationDto: PaginationDto) {
    const {offset, pageSize} = paginationDto

    await this.groupService.findOne(groupId)

    const includeParams: Prisma.GroupBanInclude = {
      banned: {
        include: {
          images: {
            include: {
              image: true
            }
          }
        }
      }
    }
    const banned = await this.prisma.groupBan.findMany({
      where: {groupId},
      include: includeParams,
      take: pageSize,
      skip: offset,
      orderBy: {
        createdAt: "desc"
      }
    })

    const count = await this.prisma.groupBan.count({
      where: {groupId}
    })

    const bannedDtos = banned.map(ban => new BannedUserDto(ban))

    return new BannedUsersResponseDto(bannedDtos, count, paginationDto)
  }

  async unban(unbanDto: CreateBanParamDto) {
    const {userId, groupId} = unbanDto

    await this.userService.findOne(userId)
    await this.groupService.findOne(groupId)

    const isBanned = await this.isBanned(userId, groupId)

    if (!isBanned) {
      throw new BadRequestException("User isn't banned, so you can't unban him!")
    }

    await this.prisma.groupBan.deleteMany({
      where: {groupId, bannedId: userId}
    })
  }

  async isBanned(userId: number, groupId: number) {
    const ban = await this.prisma.groupBan.findFirst({
      where: {
        groupId, bannedId: userId
      }
    })

    return ban
  }
}
