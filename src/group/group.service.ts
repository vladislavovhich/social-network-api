import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryService } from 'src/category/category.service';
import { Group, User, Image, Prisma } from '@prisma/client';
import { ImageService } from 'src/image/image.service';
import { GetOneGroupDto } from './dto/get-one-group.dto';
import { GroupPaginationDto } from './dto/group-pagination.dto';
import { GroupPaginationResponseDto } from './dto/group-pagination-response.dto';
import { ModeratorOpDto } from './dto/moderator-op.dto';
import { UserInfoDto } from 'src/user/dto/user-info.dto';
import { BanService } from 'src/ban/ban.service';
import { UserPassEnum } from './group.types';

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly imageService: ImageService,
    @Inject(forwardRef(() => BanService))
    private readonly banService: BanService
  ) {}

  async isActionAllowed(groupId: number, userId: number, passType: UserPassEnum, throwExp: boolean = true) {
    const isAdmin = await this.isAdmin(groupId, userId)
    const isModerator = await this.isModerator(userId, groupId)

    const isBanned = await this.banService.isBanned(userId, groupId)

    if (isBanned) {
      throw new ForbiddenException("You're banned, so you can't access it")
    }

    if (passType) {
      switch (passType) {
        case UserPassEnum.Admin: {
          if (!isAdmin && throwExp) {
            throw new ForbiddenException("You aren't admin, so you can't do this action!")
          } else {
            return false
          }
        }

        case UserPassEnum.AdminAndModerators: {
          if (!isAdmin && (isAdmin == isModerator) && throwExp) {
            throw new ForbiddenException("You are neither admin nor moderator, so you can't do this action!")
          } else {
            return false
          }
        }

        case UserPassEnum.Moderators: {
          if (!isModerator && throwExp) {
            throw new ForbiddenException("You aren't moderator, so you can't do this action!")
          }
        }
      }
    }

    return isAdmin || isModerator
  }

  async isModerator(userId: number, groupId: number) {
    await this.prisma.user.findFirstOrThrow({where: {id: userId}})

    const moderator = await this.prisma.groupModerator.findFirst({
      where: {
        groupId,
        moderatorId: userId
      }
    })

    return !!moderator
  }

  async addModerator(moderatorOpDto: ModeratorOpDto) {
    const {groupId, userId} = moderatorOpDto

    await this.findOne(groupId)
    
    const isModerator = await this.isModerator(userId, groupId)
    const isAdmin = await this.isAdmin(groupId, userId)

    if (isAdmin) {
      throw new BadRequestException("User is admin, so you can't make him to be moderator")
    }

    if (isModerator) {
      throw new BadRequestException("This user is already a moderator!")
    }

    await this.prisma.groupModerator.create({
      data: {
        group: {connect: {id: groupId}},
        moderator: {connect: {id: userId}}
      }
    })
  }

  async removeModerator(moderatorOpDto: ModeratorOpDto) {
    const {groupId, userId} = moderatorOpDto

    await this.findOne(groupId)
    
    const isModerator = await this.isModerator(userId, groupId)

    if (!isModerator) {
      throw new BadRequestException("This user isn't moderator, so you can't remove him!")
    }

    await this.prisma.groupModerator.deleteMany({
      where: {groupId, moderatorId: userId}
    })
  }

  async getModerators(groupId: number) {
    const group = await this.prisma.group.findFirstOrThrow({
      where: {id: groupId},
      include: {
        moderators: {
          include: {
            moderator: {
              include: {
                images: {
                  include: {
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const moderatorDtos = group.moderators.map(moderator => new UserInfoDto(moderator.moderator))

    return moderatorDtos
  }

  async isAdmin(groupId: number, userId: number) {
    const item = await this.findOne(groupId)

    return item.adminId == userId
  }

  async isSubscribed(groupId: number, userId: number) {
    await this.findOne(groupId)

    return await this.prisma.groupSub.findFirst({
      where: {userId, groupId}
    })
  }

  async subscribe(groupId: number, userId: number) {
    const isSub = await this.isSubscribed(groupId, userId)

    if (isSub) {
      throw new BadRequestException("You're already a sub of the groud")
    }

    await this.prisma.groupSub.create({
      data: {
        user: {connect: {id: userId}},
        group: {connect: {id: groupId}}
      }
    })
  }

  async unsubscribe(groupId: number, userId: number) {
    const isSub = await this.isSubscribed(groupId, userId)

    if (!isSub) {
      throw new BadRequestException("You're not a sub of the groud")
    }

    await this.prisma.groupSub.delete({
      where: {
        userId_groupId: {
          groupId, userId
        }
      }
    })
  }

  async create(createGroupDto: CreateGroupDto) {
    const {adminId, name, description, file, categories: categoryNames} = createGroupDto

    const categories = await this.categoryService.handleCategories(categoryNames, adminId)
    const images: Image[] = []

    if (file) {
      const image = await this.imageService.uploadImage(file)

      images.push(image)
    }

    return await this.prisma.group.create({
      data: {
        name,
        description,
        admin: {connect: {id: adminId}},
        categories: {
          create: categories.map(cat => ({category: {connect: {id: cat.id}}}))
        }
      }
    })
  }

  private getOneGroupParams(): Prisma.GroupFindManyArgs {
    return {
      include: {
        _count: {
          select: {
            subs: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        images: {
          include: {
            image: true
          }
        },
        admin: {
          include: {
            images: {
              include: {
                image: true
              }
            }
          }
        }
      }
    }

  }
  async getAllGroups(groupPaginationDto: GroupPaginationDto) {
    const {title, categories, offset, pageSize} = groupPaginationDto
    const {include: includeOptions} = this.getOneGroupParams()

    const whereOptions: Prisma.GroupWhereInput = {
      name: {
        contains: title
      },
      categories: {
        some: {
          category: {
            name: {
              in: categories,
              mode: "insensitive"
            }
          }
        }
      }
    }

    const groups = await this.prisma.group.findMany({
      take: pageSize,
      skip: offset,
      where: whereOptions,
      include: includeOptions,
      orderBy: {
        subs: {
          _count: "desc"
        }
      }
    })

    const count = await this.prisma.group.count({
      where: whereOptions
    })

    const groupsDtos = groups.map(group => new GetOneGroupDto(group))

    return new GroupPaginationResponseDto(groupsDtos, count, groupPaginationDto)
  }

  async findOne(id: number) {
    return await this.prisma.group.findFirstOrThrow({where: {id}})
  }

  async getOneGroup(id: number) {
    const groupParams = this.getOneGroupParams()

    const group = await this.prisma.group.findFirstOrThrow({
      where: {id},
      include: groupParams.include
    })

    return new GetOneGroupDto(group)
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    await this.findOne(id)
   
    const {adminId, name, description, file, categories: categoryNames} = updateGroupDto

    const categories = await this.categoryService.handleCategories(categoryNames, adminId)
    const images: Image[] = []

    if (file) {
      const image = await this.imageService.uploadImage(file)

      images.push(image)
    }

    return await this.prisma.group.update({
      where: {id},
      data: {
        name,
        description,
        categories: {
          create: categories.map(cat => ({category: {connect: {id: cat.id}}}))
        }
      }
    })
  }

  async remove(id: number) {
    const group = await this.findOne(id)

    return await this.prisma.group.delete({where: {id}})
  }
}
